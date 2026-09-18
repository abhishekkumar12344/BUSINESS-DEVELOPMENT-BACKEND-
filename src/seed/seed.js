/**
 * Seeds the database with content taken directly from the official
 * Nisha Project & Business Management LLC company profile.
 * No clients, statistics, testimonials or results are invented.
 *
 * Run:  npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Service = require('../models/Service');
const ApproachStep = require('../models/ApproachStep');
const ValueModel = require('../models/Value');
const WebsiteSetting = require('../models/WebsiteSetting');

const services = [
  {
    number: '01',
    title: 'Project Management',
    summary: 'Planning, coordination and execution support that keeps a project organised from first brief to final handover.',
    description:
      'We manage the moving parts of a project so objectives, resources and timelines stay aligned. From the initial plan through to documentation and follow-up, every stage is coordinated, tracked and reported.',
    points: [
      'Project planning and coordination',
      'Project scheduling and execution support',
      'Resource and task coordination',
      'Timeline and milestone management',
      'Progress monitoring and reporting',
      'Stakeholder coordination',
      'Project documentation and follow-up'
    ],
    order: 1
  },
  {
    number: '02',
    title: 'Business Management',
    summary: 'Day-to-day operational and administrative management support for organisations that need structure.',
    description:
      'We help organise how a business runs: processes, documentation, vendor relationships and the administrative work that keeps operations steady and measurable.',
    points: [
      'Business planning and coordination',
      'Operational management support',
      'Business process organization',
      'Administrative and management support',
      'Vendor and partner coordination',
      'Business documentation',
      'Performance and progress monitoring'
    ],
    order: 2
  },
  {
    number: '03',
    title: 'Strategic Business Support',
    summary: 'Analysis, planning assistance and management reporting that support better business decisions.',
    description:
      'We work alongside owners and management teams on growth planning, opportunity analysis and process improvement, presenting information in a form that supports clear decisions.',
    points: [
      'Business development support',
      'Market and business opportunity analysis',
      'Strategic planning assistance',
      'Business process improvement',
      'Growth planning',
      'Management reporting',
      'Decision-support information'
    ],
    order: 3
  },
  {
    number: '04',
    title: 'Business Coordination & Consulting',
    summary: 'A single point of coordination between clients, teams, partners and service providers.',
    description:
      'Communication gaps slow projects down. We coordinate between everyone involved, keep documentation current, and shape management solutions around what each client actually needs.',
    points: [
      'Client and stakeholder coordination',
      'Business communication support',
      'Project and business documentation',
      'Team and service-provider coordination',
      'Customized management solutions'
    ],
    order: 4
  }
];

const approach = [
  { number: '01', title: 'Plan', description: 'Understand objectives, requirements, resources and timelines.', detail: 'Every engagement starts with listening. We map what needs to be achieved, what is available to achieve it, and by when.', order: 1 },
  { number: '02', title: 'Organize', description: 'Create clear processes, responsibilities and priorities.', detail: 'Work is structured into defined responsibilities and sequenced priorities so nothing depends on memory or assumption.', order: 2 },
  { number: '03', title: 'Execute', description: 'Coordinate activities and maintain focus on goals.', detail: 'We coordinate people, vendors and activities day to day, keeping attention on the objectives agreed at the start.', order: 3 },
  { number: '04', title: 'Monitor', description: 'Track progress, identify challenges and maintain accountability.', detail: 'Progress is tracked against milestones. Issues are raised early, with accountability held where it belongs.', order: 4 },
  { number: '05', title: 'Deliver', description: 'Work toward timely, organized and professional outcomes.', detail: 'Delivery includes documentation and follow-up, so the result is usable long after the engagement closes.', order: 5 }
];

const values = [
  { title: 'Integrity', description: 'We believe in honest and responsible business practices.', icon: 'integrity', order: 1 },
  { title: 'Professionalism', description: 'We maintain high standards in communication, management and service delivery.', icon: 'professionalism', order: 2 },
  { title: 'Accountability', description: 'We take responsibility for our commitments and our work.', icon: 'accountability', order: 3 },
  { title: 'Innovation', description: 'We remain open to new ideas, technologies and better ways of working.', icon: 'innovation', order: 4 },
  { title: 'Collaboration', description: 'We believe strong results come from effective teamwork and communication.', icon: 'collaboration', order: 5 },
  { title: 'Client Success', description: 'We align our efforts with the objectives and expectations of our clients.', icon: 'client-success', order: 6 }
];

const run = async () => {
  await connectDB();

  // --- First super admin ---
  const email = (process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@nisha.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.SEED_SUPERADMIN_NAME || 'Nisha Super Admin',
      email,
      password: process.env.SEED_SUPERADMIN_PASSWORD || 'ChangeMe@12345',
      role: 'SUPER_ADMIN',
      designation: 'System Owner'
    });
    console.log(`Super admin created: ${email}`);
  }

  // --- Content from the company profile ---
  await Service.deleteMany();
  await Service.insertMany(services);
  console.log(`Seeded ${services.length} services`);

  await ApproachStep.deleteMany();
  await ApproachStep.insertMany(approach);
  console.log(`Seeded ${approach.length} approach steps`);

  await ValueModel.deleteMany();
  await ValueModel.insertMany(values);
  console.log(`Seeded ${values.length} values`);

  // --- Website settings (contact fields stay blank until the company fills them in) ---
  const settingsExist = await WebsiteSetting.findOne({ key: 'global' });
  if (!settingsExist) {
    await WebsiteSetting.create({
      key: 'global',
      companyName: 'Nisha Project & Business Management LLC',
      tagline: 'Your Vision. Our Management. Shared Success.',
      logo: '/nisha-logo.jpeg',
      heroImage:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      aboutImage:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      contact: {
        email: 'hello@nisha-pbm.com',
        phone: '+91 98765 43210',
        website: 'https://nisha-pbm.com',
        address: 'Surat, Gujarat, India',
        workingHours: 'Mon-Sat: 9:00 AM - 6:00 PM'
      },
      social: {
        linkedin: 'https://www.linkedin.com',
        instagram: 'https://www.instagram.com',
        facebook: 'https://www.facebook.com'
      },
      homepage: {
        heroTitle: 'Your Vision. Our Management. Shared Success.',
        heroSubtitle:
          'Professional project and business management support built around clear planning, effective coordination, disciplined execution, and sustainable business growth.',
        primaryCta: 'Discuss Your Project',
        secondaryCta: 'Explore Our Services',
        commitmentPoints: [
          'Clear objectives',
          'Organized execution',
          'Effective coordination',
          'Transparent communication',
          'Responsible management',
          'Continuous improvement',
          'Sustainable business relationships'
        ]
      },
      seo: {
        title: 'Nisha Project & Business Management LLC | Surat, Gujarat',
        description:
          'Project management, business management and strategic business support for businesses, entrepreneurs and organizations. Based in Surat, Gujarat, India.',
        keywords: 'project management, business management, Surat, business consulting',
        ogImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
      }
    });
    console.log('Seeded website settings');
  }

  await mongoose.connection.close();
  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
