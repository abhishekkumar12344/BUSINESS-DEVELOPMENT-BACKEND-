const express = require('express');
const content = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const editors = authorize('SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER');

/** Mounts /public read routes and protected write routes for one content type. */
const mount = (basePath, handlers, { hasSlug = false } = {}) => {
  router.get(`${basePath}`, handlers.listPublic);
  if (hasSlug) router.get(`${basePath}/slug/:slug`, handlers.getPublicOne);

  router.get(`${basePath}/all`, protect, handlers.listAll);
  router.get(`${basePath}/:id`, protect, handlers.getOne);
  router.post(`${basePath}`, protect, editors, handlers.create);
  router.put(`${basePath}/:id`, protect, editors, handlers.update);
  router.delete(`${basePath}/:id`, protect, editors, handlers.remove);
};

mount('/services', content.services, { hasSlug: true });
mount('/approach', content.approach);
mount('/values', content.values);
mount('/projects', content.projects, { hasSlug: true });
mount('/testimonials', content.testimonials);
mount('/team', content.team);
mount('/blogs', content.blogs, { hasSlug: true });

module.exports = router;
