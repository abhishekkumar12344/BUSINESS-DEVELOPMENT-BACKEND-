const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Lead = require('../models/Lead');
const Enquiry = require('../models/Enquiry');
const Consultation = require('../models/Consultation');
const logActivity = require('../utils/activityLogger');
const notifyAdmins = require('../utils/notify');

// POST /api/leads/contact  (public contact form)
const submitContact = asyncHandler(async (req, res) => {
  const { name, company, email, phone, service, message } = req.body;

  const lead = await Lead.create({
    name, company, email, phone, service, message, source: 'CONTACT_FORM'
  });
  const enquiry = await Enquiry.create({ name, company, email, phone, service, message, lead: lead._id });

  await notifyAdmins({
    title: 'New enquiry received',
    message: `${name}${company ? ` (${company})` : ''} sent an enquiry about ${service || 'your services'}.`,
    type: 'LEAD',
    link: `/admin/leads/${lead._id}`,
    refModel: 'Lead',
    refId: lead._id
  });

  res.status(201).json({
    success: true,
    message: 'Thank you. Your enquiry has reached our team and we will respond shortly.',
    leadId: lead.leadId,
    enquiryId: enquiry._id
  });
});

// POST /api/leads/consultation  (public "Discuss Your Project" form)
const submitConsultation = asyncHandler(async (req, res) => {
  const { name, company, email, phone, requirement, serviceRequired, timeline, message } = req.body;

  const lead = await Lead.create({
    name, company, email, phone,
    service: serviceRequired,
    requirement, timeline, message,
    source: 'CONSULTATION_FORM',
    priority: 'HIGH'
  });
  const consultation = await Consultation.create({
    name, company, email, phone, requirement, serviceRequired, timeline, message, lead: lead._id
  });

  await notifyAdmins({
    title: 'New consultation request',
    message: `${name} requested a consultation for ${serviceRequired || 'a project'}${timeline ? ` (${timeline})` : ''}.`,
    type: 'CONSULTATION',
    link: `/admin/leads/${lead._id}`,
    refModel: 'Consultation',
    refId: consultation._id
  });

  res.status(201).json({
    success: true,
    message: 'Your consultation request has been received. Our team will contact you to plan the next step.',
    leadId: lead.leadId
  });
});

// GET /api/leads  (search + filter + sort + pagination)
const getLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const { search = '', status, priority, service, source, assignedTo, sort = '-createdAt' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (service) query.service = service;
  if (source) query.source = source;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) {
    const rx = new RegExp(String(search).trim(), 'i');
    query.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }, { leadId: rx }, { message: rx }];
  }

  const [leads, total, statusCounts] = await Promise.all([
    Lead.find(query).populate('assignedTo', 'name email role').sort(sort).skip((page - 1) * limit).limit(limit),
    Lead.countDocuments(query),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);

  res.json({
    success: true,
    leads,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
  });
});

// GET /api/leads/:id
const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('notes.addedBy', 'name role');
  if (!lead) throw new ApiError(404, 'Lead not found.');
  res.json({ success: true, lead });
});

// POST /api/leads  (manual entry from admin)
const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({ ...req.body, source: req.body.source || 'MANUAL' });
  await logActivity({ req, action: 'CREATE', module: 'Leads', description: `Created lead ${lead.leadId}`, targetId: lead._id });
  res.status(201).json({ success: true, lead });
});

// PUT /api/leads/:id
const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, 'Lead not found.');

  const fields = ['name', 'company', 'email', 'phone', 'service', 'requirement', 'timeline', 'message', 'status', 'priority', 'assignedTo'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) lead[f] = req.body[f] === '' && f === 'assignedTo' ? null : req.body[f];
  });

  await lead.save();
  await logActivity({
    req,
    action: req.body.assignedTo !== undefined ? 'ASSIGN' : 'UPDATE',
    module: 'Leads',
    description: `Updated lead ${lead.leadId}${req.body.status ? ` → ${req.body.status}` : ''}`,
    targetId: lead._id
  });
  res.json({ success: true, lead });
});

// POST /api/leads/:id/notes
const addNote = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, 'Lead not found.');
  if (!req.body.text || !req.body.text.trim()) throw new ApiError(400, 'Write a note before saving.');

  lead.notes.push({ text: req.body.text.trim(), addedBy: req.user._id, addedByName: req.user.name });
  await lead.save();
  await logActivity({ req, action: 'UPDATE', module: 'Leads', description: `Added note to ${lead.leadId}`, targetId: lead._id });
  res.status(201).json({ success: true, lead });
});

// DELETE /api/leads/:id
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, 'Lead not found.');
  await lead.deleteOne();
  await Enquiry.deleteMany({ lead: lead._id });
  await Consultation.deleteMany({ lead: lead._id });
  await logActivity({ req, action: 'DELETE', module: 'Leads', description: `Deleted lead ${lead.leadId}` });
  res.json({ success: true, message: 'Lead deleted.' });
});

// GET /api/leads/export  (CSV)
const exportLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().populate('assignedTo', 'name').sort('-createdAt').lean();
  const header = ['Lead ID', 'Name', 'Company', 'Email', 'Phone', 'Service', 'Status', 'Priority', 'Assigned To', 'Created', 'Message'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [l.leadId, l.name, l.company, l.email, l.phone, l.service, l.status, l.priority, l.assignedTo?.name || 'Unassigned', new Date(l.createdAt).toLocaleString(), l.message]
      .map(esc)
      .join(',')
  );
  await logActivity({ req, action: 'EXPORT', module: 'Leads', description: `Exported ${leads.length} leads` });

  res.header('Content-Type', 'text/csv');
  res.attachment(`nisha-leads-${Date.now()}.csv`);
  res.send([header.join(','), ...rows].join('\n'));
});

module.exports = { submitContact, submitConsultation, getLeads, getLead, createLead, updateLead, addNote, deleteLead, exportLeads };
