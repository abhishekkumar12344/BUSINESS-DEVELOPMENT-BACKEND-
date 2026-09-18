const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logActivity = require('../utils/activityLogger');

/**
 * Builds a consistent set of CMS handlers for any content model.
 * Public reads only return published records; admin reads return everything.
 */
const crudFactory = (Model, moduleName, { defaultSort = 'order createdAt', publicFilter = { isPublished: true } } = {}) => ({
  listPublic: asyncHandler(async (req, res) => {
    const items = await Model.find(publicFilter).sort(defaultSort);
    res.json({ success: true, count: items.length, items });
  }),

  getPublicOne: asyncHandler(async (req, res) => {
    const key = req.params.slug;
    const item = await Model.findOne({ ...publicFilter, slug: key });
    if (!item) throw new ApiError(404, `${moduleName} not found.`);
    res.json({ success: true, item });
  }),

  listAll: asyncHandler(async (req, res) => {
    const items = await Model.find().sort(defaultSort);
    res.json({ success: true, count: items.length, items });
  }),

  getOne: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw new ApiError(404, `${moduleName} not found.`);
    res.json({ success: true, item });
  }),

  create: asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    await logActivity({ req, action: 'CREATE', module: moduleName, description: `Created ${item.title || item.name || item._id}`, targetId: item._id });
    res.status(201).json({ success: true, item });
  }),

  update: asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new ApiError(404, `${moduleName} not found.`);
    await logActivity({
      req,
      action: req.body.isPublished !== undefined ? 'PUBLISH' : 'UPDATE',
      module: moduleName,
      description: `Updated ${item.title || item.name || item._id}`,
      targetId: item._id
    });
    res.json({ success: true, item });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, `${moduleName} not found.`);
    await logActivity({ req, action: 'DELETE', module: moduleName, description: `Deleted ${item.title || item.name || item._id}` });
    res.json({ success: true, message: `${moduleName} deleted.` });
  })
});

module.exports = crudFactory;
