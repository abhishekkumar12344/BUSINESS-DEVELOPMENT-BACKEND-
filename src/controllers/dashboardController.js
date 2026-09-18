const asyncHandler = require('../utils/asyncHandler');
const Lead = require('../models/Lead');
const Enquiry = require('../models/Enquiry');
const Consultation = require('../models/Consultation');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const ActivityLog = require('../models/ActivityLog');

// GET /api/dashboard/stats  - every number is a live count, never a placeholder.
const getStats = asyncHandler(async (req, res) => {
  const [
    totalEnquiries, newEnquiries, totalLeads, newLeads, consultations, newConsultations,
    activeProjects, completedProjects, publishedBlogs, unreadMessages
  ] = await Promise.all([
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ isRead: false }),
    Lead.countDocuments(),
    Lead.countDocuments({ status: 'NEW' }),
    Consultation.countDocuments(),
    Consultation.countDocuments({ status: 'NEW' }),
    Project.countDocuments({ status: 'ACTIVE' }),
    Project.countDocuments({ status: 'COMPLETED' }),
    Blog.countDocuments({ isPublished: true }),
    Enquiry.countDocuments({ isRead: false })
  ]);

  const statusBreakdown = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const serviceBreakdown = await Lead.aggregate([
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 }
  ]);

  // Leads per month for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRaw = await Lead.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.y': 1, '_id.m': 1 } }
  ]);

  const labels = [];
  const monthly = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(sixMonthsAgo.getMonth() + i);
    const found = monthlyRaw.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    labels.push(d.toLocaleString('en-IN', { month: 'short' }));
    monthly.push(found ? found.count : 0);
  }

  const [recentLeads, recentActivity] = await Promise.all([
    Lead.find().sort('-createdAt').limit(6).populate('assignedTo', 'name'),
    ActivityLog.find().sort('-createdAt').limit(8)
  ]);

  res.json({
    success: true,
    stats: {
      totalEnquiries, newEnquiries, totalLeads, newLeads,
      consultations, newConsultations, activeProjects, completedProjects,
      publishedBlogs, unreadMessages
    },
    charts: {
      monthly: { labels, data: monthly },
      statusBreakdown: statusBreakdown.reduce((a, s) => ({ ...a, [s._id]: s.count }), {}),
      serviceBreakdown: serviceBreakdown.map((s) => ({ service: s._id || 'Not specified', count: s.count }))
    },
    recentLeads,
    recentActivity
  });
});

module.exports = { getStats };
