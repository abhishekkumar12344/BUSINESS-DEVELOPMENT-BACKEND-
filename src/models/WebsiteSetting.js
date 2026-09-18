const mongoose = require('mongoose');

/**
 * Single-document settings store. Contact details are intentionally blank
 * placeholders - the company fills them in from the admin panel.
 */
const websiteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    companyName: { type: String, default: 'Nisha Project & Business Management LLC' },
    tagline: { type: String, default: 'Your Vision. Our Management. Shared Success.' },
    logo: { type: String, default: '/nisha-logo.jpeg' },
    heroImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
    },
    aboutImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
    },
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      website: { type: String, default: '' },
      address: { type: String, default: 'Surat, Gujarat, India' },
      mapEmbed: { type: String, default: '' },
      workingHours: { type: String, default: '' }
    },
    social: {
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    homepage: {
      heroTitle: { type: String, default: 'Your Vision. Our Management. Shared Success.' },
      heroSubtitle: {
        type: String,
        default:
          'Professional project and business management support built around clear planning, effective coordination, disciplined execution, and sustainable business growth.'
      },
      primaryCta: { type: String, default: 'Discuss Your Project' },
      secondaryCta: { type: String, default: 'Explore Our Services' },
      commitmentPoints: [{ type: String }]
    },
    seo: {
      title: { type: String, default: 'Nisha Project & Business Management LLC | Surat, Gujarat' },
      description: {
        type: String,
        default:
          'Project management, business management and strategic business support for businesses, entrepreneurs and organizations. Based in Surat, Gujarat, India.'
      },
      keywords: { type: String, default: 'project management, business management, Surat, business consulting' },
      ogImage: { type: String, default: '' }
    },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
