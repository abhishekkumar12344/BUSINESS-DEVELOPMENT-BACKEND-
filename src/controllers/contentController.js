const crudFactory = require('./crudFactory');
const Service = require('../models/Service');
const ApproachStep = require('../models/ApproachStep');
const ValueModel = require('../models/Value');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const TeamMember = require('../models/TeamMember');
const Blog = require('../models/Blog');

module.exports = {
  services: crudFactory(Service, 'Services'),
  approach: crudFactory(ApproachStep, 'Approach'),
  values: crudFactory(ValueModel, 'Values'),
  projects: crudFactory(Project, 'Projects', { defaultSort: 'order -createdAt' }),
  testimonials: crudFactory(Testimonial, 'Testimonials'),
  team: crudFactory(TeamMember, 'Team'),
  blogs: crudFactory(Blog, 'Insights', { defaultSort: '-publishedAt -createdAt' })
};
