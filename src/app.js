import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root / Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fastor CRM REST API is up and running',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
      },
      enquiries: {
        publicSubmission: 'POST /api/enquiries/public (Public - No Auth)',
        getUnclaimed: 'GET /api/enquiries/unclaimed (Protected)',
        claimLead: 'PATCH /api/enquiries/:id/claim (Protected)',
        getMyClaimed: 'GET /api/enquiries/claimed (Protected)',
        getSingleLead: 'GET /api/enquiries/:id (Protected)',
      },
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
