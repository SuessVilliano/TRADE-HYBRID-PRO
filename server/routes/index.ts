import express from 'express';
import authRoutes from './auth';
import webhooksRoutes from './webhooks';
import signalsRoutes from './signals';
import tradingViewRoutes from './tradingview';
import brokerRoutes from './brokers';
import aiInsightsHandler from '../api/ai-insights';
import marketDataHandler from '../api/market-data';

const router = express.Router();

// Auth routes
router.use('/auth', authRoutes);

// Webhooks routes
router.use('/webhooks', webhooksRoutes);

// Signals routes
router.use('/signals', signalsRoutes);

// TradingView routes
router.use('/tradingview', tradingViewRoutes);

// Broker routes
router.use('/brokers', brokerRoutes);

// AI Insights routes
router.use('/ai-insights', (req, res) => aiInsightsHandler(req, res));

// Market Data routes
router.use('/market-data/:provider', (req, res) => marketDataHandler(req, res));

export default router;