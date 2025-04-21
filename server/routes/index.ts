import express from 'express';
import validatorRoutes from './validator';

// Import other routes as needed
// The commented imports are preserved for documentation, 
// but we're only using the validator routes for now
// import authRoutes from './auth';
// import webhooksRoutes from './webhooks';
// import signalsRoutes from './signals';
// import tradingViewRoutes from './tradingview';
// import brokerRoutes from './brokers';
// import oandaMarketRoutes from './oanda-market';
// import marketDataRoutes from './market-data';
// import marketDataStatusRoutes from './market-data-status';

const router = express.Router();

// We only need to register the validator routes for now
// Other routes are registered in server/routes.ts

// Validator routes
router.use('/validator', validatorRoutes);

export default router;