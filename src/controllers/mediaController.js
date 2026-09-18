const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Media = require('../models/Media');
const logActivity = require('../utils/activityLogger');

// POST /api/media
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose a file to upload.');
  const media = await Media.create({
    title: req.body.title || req.file.originalname,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
    folder: req.body.folder || 'general',
    altText: req.body.altText || '',
    uploadedBy: req.user._id
  });
  await logActivity({ req, action: 'CREATE', module: 'Media', description: `Uploaded ${media.originalName}`, targetId: media._id });
  res.status(201).json({ success: true, media });
});

// GET /api/media
const getMedia = asyncHandler(async (req, res) => {
  const query = req.query.folder ? { folder: req.query.folder } : {};
  const items = await Media.find(query).populate('uploadedBy', 'name').sort('-createdAt');
  res.json({ success: true, count: items.length, items });
});

// DELETE /api/media/:id
const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, 'File not found.');

  const filePath = path.join(__dirname, '..', '..', 'uploads', media.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await media.deleteOne();
  await logActivity({ req, action: 'DELETE', module: 'Media', description: `Deleted ${media.originalName}` });
  res.json({ success: true, message: 'File deleted.' });
});

module.exports = { uploadMedia, getMedia, deleteMedia };
