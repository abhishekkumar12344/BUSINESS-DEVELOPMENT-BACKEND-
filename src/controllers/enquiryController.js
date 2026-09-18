const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Enquiry = require('../models/Enquiry');
const Consultation = require('../models/Consultation');
const logActivity = require('../utils/activityLogger');

const paginate = async (Model, req, populate = '') => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).trim(), 'i');
    query.$or = [{ name: rx }, { email: rx }, { company: rx }];
  }
  const [items, total] = await Promise.all([
    Model.find(query).populate(populate).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Model.countDocuments(query)
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
};

const getEnquiries = asyncHandler(async (req, res) => {
  const data = await paginate(Enquiry, req, 'lead');
  res.json({ success: true, enquiries: data.items, pagination: data.pagination });
});

const markEnquiryRead = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found.');
  enquiry.isRead = !enquiry.isRead;
  enquiry.handledBy = req.user._id;
  await enquiry.save();
  res.json({ success: true, enquiry });
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found.');
  await logActivity({ req, action: 'DELETE', module: 'Enquiries', description: `Deleted enquiry from ${enquiry.name}` });
  res.json({ success: true, message: 'Enquiry deleted.' });
});

const getConsultations = asyncHandler(async (req, res) => {
  const data = await paginate(Consultation, req, 'lead');
  res.json({ success: true, consultations: data.items, pagination: data.pagination });
});

const updateConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, scheduledAt: req.body.scheduledAt || null, handledBy: req.user._id },
    { new: true }
  );
  if (!consultation) throw new ApiError(404, 'Consultation not found.');
  await logActivity({ req, action: 'UPDATE', module: 'Consultations', description: `Consultation for ${consultation.name} → ${consultation.status}` });
  res.json({ success: true, consultation });
});

const deleteConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findByIdAndDelete(req.params.id);
  if (!consultation) throw new ApiError(404, 'Consultation not found.');
  await logActivity({ req, action: 'DELETE', module: 'Consultations', description: `Deleted consultation from ${consultation.name}` });
  res.json({ success: true, message: 'Consultation deleted.' });
});

module.exports = { getEnquiries, markEnquiryRead, deleteEnquiry, getConsultations, updateConsultation, deleteConsultation };
