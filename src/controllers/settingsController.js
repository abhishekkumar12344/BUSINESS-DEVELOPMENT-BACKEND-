const asyncHandler = require('../utils/asyncHandler');
const WebsiteSetting = require('../models/WebsiteSetting');
const logActivity = require('../utils/activityLogger');

const getOrCreate = async () => {
  let settings = await WebsiteSetting.findOne({ key: 'global' });
  if (!settings) settings = await WebsiteSetting.create({ key: 'global' });
  return settings;
};

// GET /api/settings  (public - powers header, footer, contact page)
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  res.json({ success: true, settings });
});

// PUT /api/settings  (admin)
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  const { companyName, tagline, logo, heroImage, aboutImage, contact, social, homepage, seo, maintenanceMode } = req.body;

  if (companyName !== undefined) settings.companyName = companyName;
  if (tagline !== undefined) settings.tagline = tagline;
  if (logo !== undefined) settings.logo = logo;
  if (heroImage !== undefined) settings.heroImage = heroImage;
  if (aboutImage !== undefined) settings.aboutImage = aboutImage;
  if (contact) settings.contact = { ...settings.contact.toObject(), ...contact };
  if (social) settings.social = { ...settings.social.toObject(), ...social };
  if (homepage) settings.homepage = { ...settings.homepage.toObject(), ...homepage };
  if (seo) settings.seo = { ...settings.seo.toObject(), ...seo };
  if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
  settings.updatedBy = req.user._id;

  await settings.save();
  await logActivity({ req, action: 'SETTINGS', module: 'Settings', description: 'Website settings updated' });
  res.json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };
