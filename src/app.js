const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.set('trust proxy', 1);

// --- Security ---
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

// --- CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://nisha-project-business-management.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// --- Rate limit ---
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please slow down.'
    }
  })
);

// --- Parsers ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Static uploads ---
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Routes ---
app.get('/api/health', (req, res) =>
  res.json({
    success: true,
    service: 'Nisha Project & Business Management API',
    time: new Date().toISOString()
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;