import express from 'express';
import { 
  getAllTradeSignals, 
  getTradeSignalsByProvider, 
  createTradeSignal, 
  updateTradeSignalStatus,
  logCopyTradeSignal
} from './trading-signals';

const router = express.Router();

// Trade Signals API endpoints
router.get('/trading-signals', getAllTradeSignals);
router.get('/trading-signals/provider/:providerId', getTradeSignalsByProvider);
router.post('/trading-signals', createTradeSignal);
router.put('/trading-signals/:id', updateTradeSignalStatus);
router.post('/trading-signals/copy', logCopyTradeSignal);

export default router;