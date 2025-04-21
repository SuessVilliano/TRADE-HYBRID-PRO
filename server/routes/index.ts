import express from 'express';
import authRoutes from './auth';
import webhooksRoutes from './webhooks';
import signalsRoutes from './signals';
import tradingViewRoutes from './tradingview';
import brokerRoutes from './brokers';
import oandaMarketRoutes from './oanda-market';
import marketDataRoutes from './market-data';
import marketDataStatusRoutes from './market-data-status';
import validatorRoutes from './validator';
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

// New real-time Market Data routes
router.use('/market-data', marketDataRoutes);

// Market Data Status routes
router.use('/market-data-status', marketDataStatusRoutes);

// Oanda specific market data routes
router.use('/oanda', oandaMarketRoutes);

// Legacy Market Data provider routes
router.use('/market-data/:provider', (req, res) => marketDataHandler(req, res));

// Validator routes
router.use('/validator', validatorRoutes);

export default router;