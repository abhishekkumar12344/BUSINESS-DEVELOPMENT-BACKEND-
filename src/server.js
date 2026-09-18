require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');
const ApproachStep = require('./models/ApproachStep');
const ValueModel = require('./models/Value');
const Project = require('./models/Project');
const TeamMember = require('./models/TeamMember');
const Testimonial = require('./models/Testimonial');
const Blog = require('./models/Blog');
const WebsiteSetting = require('./models/WebsiteSetting');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const demoServices = [
  {
    number: '01',
    title: 'Project Management',
    summary: 'Planning, coordination and execution support for projects from brief to handover.',
    description: 'Structured planning and management for projects that need clear milestones, accountability and visibility.',
    points: ['Planning', 'Coordination', 'Monitoring', 'Reporting'],
    order: 1,
    isPublished: true
  },
  {
    number: '02',
    title: 'Business Management',
    summary: 'Operational structure for businesses that need steadier processes and coordination.',
    description: 'Practical management support for operational routines, administration and delivery discipline.',
    points: ['Operations', 'Documentation', 'Process design', 'Administration'],
    order: 2,
    isPublished: true
  },
  {
    number: '03',
    title: 'Strategic Business Support',
    summary: 'Insight-led planning support to improve decisions and growth opportunities.',
    description: 'Focused guidance for market analysis, process improvement and growth planning.',
    points: ['Market review', 'Planning support', 'Performance tracking', 'Decision support'],
    order: 3,
    isPublished: true
  },
  {
    number: '04',
    title: 'Business Coordination & Consulting',
    summary: 'A clear point of coordination between clients, teams and service providers.',
    description: 'Connecting work, stakeholders and communication so projects move forward without friction.',
    points: ['Stakeholder management', 'Vendor coordination', 'Communication', 'Risk oversight'],
    order: 4,
    isPublished: true
  }
];

const demoApproach = [
  { number: '01', title: 'Plan', description: 'Understand scope and priorities.', detail: 'We map the objective, timeline and required resources before work begins.', order: 1, isPublished: true },
  { number: '02', title: 'Organize', description: 'Create structure and ownership.', detail: 'Responsibilities and decision points are defined early so work stays coherent.', order: 2, isPublished: true },
  { number: '03', title: 'Execute', description: 'Coordinate delivery and communication.', detail: 'Monitoring and coordination keep the work on track and aligned with the brief.', order: 3, isPublished: true },
  { number: '04', title: 'Monitor', description: 'Track progress and gaps.', detail: 'We review milestones, identify issues early and tighten controls when needed.', order: 4, isPublished: true },
  { number: '05', title: 'Deliver', description: 'Close with clear accountability.', detail: 'Results are handed over with documentation, reporting and practical follow-through.', order: 5, isPublished: true }
];

const demoValues = [
  { title: 'Integrity', description: 'Honest, responsible and dependable business practices.', icon: 'integrity', order: 1, isPublished: true },
  { title: 'Professionalism', description: 'Clear standards and disciplined delivery in every engagement.', icon: 'professionalism', order: 2, isPublished: true },
  { title: 'Accountability', description: 'Ownership of outcomes, timelines and communication.', icon: 'accountability', order: 3, isPublished: true },
  { title: 'Innovation', description: 'Practical improvements and smarter ways of working.', icon: 'innovation', order: 4, isPublished: true },
  { title: 'Collaboration', description: 'Strong coordination between people, partners and teams.', icon: 'collaboration', order: 5, isPublished: true },
  { title: 'Client Success', description: 'Every action is aligned with the client’s real goals.', icon: 'client-success', order: 6, isPublished: true }
];

const demoProjects = [
  { title: 'Expansion planning for a service company', client: 'Apex Process Group', sector: 'Professional Services', serviceType: 'Business Management', status: 'ACTIVE', summary: 'Built a work plan and reporting rhythm for a growing service business.', challenge: 'The company was growing fast without a formal management structure.', approach: 'We mapped responsibilities, milestones and weekly coordination routines.', outcome: 'The team gained more visibility and reduced planning friction.', isPublished: true, order: 1 },
  { title: 'Project coordination for a property launch', client: 'Silkline Realty', sector: 'Real Estate', serviceType: 'Project Management', status: 'ACTIVE', summary: 'Coordinated launch tasks across vendors, timing and reporting needs.', challenge: 'Multiple stakeholders were working without a shared project plan.', approach: 'We created a milestone tracker and communication plan for the launch sequence.', outcome: 'Delivery became more predictable and stakeholders stayed aligned.', isPublished: true, order: 2 },
  { title: 'Business process cleanup for a growing firm', client: 'Harbor Trade Solutions', sector: 'Trading', serviceType: 'Business Coordination & Consulting', status: 'COMPLETED', summary: 'Simplified process ownership and internal coordination.', challenge: 'The firm had multiple informal methods and slow handoffs between teams.', approach: 'We documented the main workstreams and aligned ownership across departments.', outcome: 'Processes became easier to follow and internal coordination improved.', isPublished: true, order: 3 },
  { title: 'Strategy support for new market entry', client: 'Northgate Ventures', sector: 'Consulting', serviceType: 'Strategic Business Support', status: 'PLANNING', summary: 'Prepared a practical entry plan and early business review.', challenge: 'The team needed better structure before launching into a new segment.', approach: 'We reviewed opportunities, requirements and delivery steps with a structured plan.', outcome: 'The business gained a clearer roadmap for next steps.', isPublished: true, order: 4 },
  { title: 'Operational review for a small business', client: 'Garden & Co.', sector: 'Retail', serviceType: 'Business Management', status: 'COMPLETED', summary: 'Reviewed current operations and introduced a cleaner management rhythm.', challenge: 'The business needed a more disciplined operating framework.', approach: 'We reviewed work patterns and introduced a practical coordination model.', outcome: 'The owner gained better visibility across operations and responsibilities.', isPublished: true, order: 5 }
];

const demoTeam = [
  { name: 'Aarav Mehta', designation: 'Project Director', bio: 'Leads project planning, coordination and delivery oversight.', email: 'aarav@nisha-pbm.com', order: 1, isPublished: true },
  { name: 'Nikita Shah', designation: 'Business Strategy Lead', bio: 'Supports business planning, growth alignment and stakeholder management.', email: 'nikita@nisha-pbm.com', order: 2, isPublished: true },
  { name: 'Rohan Desai', designation: 'Operations Manager', bio: 'Builds practical operating systems for smoother day-to-day execution.', email: 'rohan@nisha-pbm.com', order: 3, isPublished: true }
];

const demoTestimonials = [
  { clientName: 'Manoj Patel', designation: 'Director', company: 'Legacy Group', quote: 'Their process helped us bring order to a busy operating environment and kept the team aligned.', rating: 5, order: 1, isPublished: true },
  { clientName: 'Rhea Kapoor', designation: 'Founder', company: 'Northline Studio', quote: 'The communication and planning structure was exactly what we needed to move ahead with confidence.', rating: 5, order: 2, isPublished: true },
  { clientName: 'Siddharth Sen', designation: 'Operations Lead', company: 'Harbor Trade', quote: 'They brought clarity to the workstream and helped us strengthen ownership across the business.', rating: 5, order: 3, isPublished: true }
];

const demoBlogs = [
  { title: 'Why clear project structure matters', excerpt: 'Small gaps in planning often become bigger issues in execution.', content: 'Clear structure makes work visible, faster to coordinate and easier to manage.', category: 'Project Management', tags: ['planning', 'execution'], authorName: 'Nisha Editorial Desk', readTime: '4 min read', isPublished: true, publishedAt: new Date() },
  { title: 'Five habits that improve business coordination', excerpt: 'Strong coordination is built from repeatable patterns, not reactive fixes.', content: 'A disciplined rhythm for communication, ownership and follow-through improves business operations significantly.', category: 'Business Management', tags: ['operations', 'coordination'], authorName: 'Nisha Editorial Desk', readTime: '5 min read', isPublished: true, publishedAt: new Date() }
];

const ensureDemoAdmin = async () => {
  const email = (process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@nisha.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      name: process.env.SEED_SUPERADMIN_NAME || 'Nisha Super Admin',
      email,
      password: process.env.SEED_SUPERADMIN_PASSWORD || 'ChangeMe@12345',
      role: 'SUPER_ADMIN',
      designation: 'System Owner'
    });
    console.log(`Demo admin created: ${email}`);
  } else {
    console.log(`Demo admin ready: ${email}`);
  }
};

const ensureDemoContent = async () => {
  const hasServices = await Service.countDocuments();
  if (!hasServices) {
    await Service.insertMany(demoServices);
    console.log(`Seeded ${demoServices.length} demo services.`);
  }

  const hasApproach = await ApproachStep.countDocuments();
  if (!hasApproach) {
    await ApproachStep.insertMany(demoApproach);
    console.log(`Seeded ${demoApproach.length} demo approach steps.`);
  }

  const hasValues = await ValueModel.countDocuments();
  if (!hasValues) {
    await ValueModel.insertMany(demoValues);
    console.log(`Seeded ${demoValues.length} demo values.`);
  }

  const hasProjects = await Project.countDocuments();
  if (!hasProjects) {
    await Project.insertMany(demoProjects);
    console.log(`Seeded ${demoProjects.length} demo projects.`);
  }

  const hasTeam = await TeamMember.countDocuments();
  if (!hasTeam) {
    await TeamMember.insertMany(demoTeam);
    console.log(`Seeded ${demoTeam.length} demo team members.`);
  }

  const hasTestimonials = await Testimonial.countDocuments();
  if (!hasTestimonials) {
    await Testimonial.insertMany(demoTestimonials);
    console.log(`Seeded ${demoTestimonials.length} demo testimonials.`);
  }

  const hasBlogs = await Blog.countDocuments();
  if (!hasBlogs) {
    await Blog.insertMany(demoBlogs);
    console.log(`Seeded ${demoBlogs.length} demo blog posts.`);
  }

  const settings = await WebsiteSetting.findOne({ key: 'global' });
  if (!settings) {
    await WebsiteSetting.create({
      key: 'global',
      companyName: 'Nisha Project & Business Management LLC',
      tagline: 'Your Vision. Our Management. Shared Success.',
      logo: '/nisha-logo.jpeg',
      heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      aboutImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
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
        heroSubtitle: 'Professional project and business management support built around clear planning, effective coordination, disciplined execution, and sustainable growth.',
        primaryCta: 'Discuss Your Project',
        secondaryCta: 'Explore Our Services',
        commitmentPoints: ['Clear objectives', 'Organized execution', 'Effective coordination', 'Transparent communication', 'Responsible management', 'Continuous improvement']
      },
      seo: {
        title: 'Nisha Project & Business Management LLC | Surat, Gujarat',
        description: 'Business management, project planning and strategic support for organizations seeking structure and dependable execution.',
        keywords: 'project management, business management, Surat, consultancy',
        ogImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
      }
    });
    console.log('Seeded global website settings.');
  }
};

connectDB().then(async () => {
  await ensureDemoAdmin();
  await ensureDemoContent();

  const server = app.listen(PORT, () =>
    console.log(`Nisha API running in ${process.env.NODE_ENV || 'development'} on http://localhost:${PORT}`)
  );

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
});
