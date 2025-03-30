
import { google } from 'googleapis';
import { SheetsSignal, SignalSource } from '../types';
import { processSignal } from './signals';

export class SheetsService {
  private auth;
  private sheets;
  
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async getSignals(source: SignalSource): Promise<SheetsSignal[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: source.sheetId,
        range: source.range,
      });
      
      const signals = response.data.values?.map(row => ({
        symbol: row[0],
        action: row[1]?.toLowerCase(),
        entryPrice: parseFloat(row[2]),
        stopLoss: parseFloat(row[3]),
        takeProfit1: parseFloat(row[4]),
        takeProfit2: parseFloat(row[5]),
        timestamp: new Date(row[6] || Date.now()),
        source: source.name,
        broker: source.defaultBroker,
        confidence: parseInt(row[7]) || 75
      })) || [];

      return signals.filter(s => s.symbol && s.action && s.entryPrice);
    } catch (error) {
      console.error(`Error fetching signals from ${source.name}:`, error);
      return [];
    }
  }
}

export const SIGNAL_SOURCES: SignalSource[] = [
  {
    name: 'solaris',
    sheetId: process.env.SOLARIS_SHEET_ID || '',
    range: 'Signals!A2:H',
    defaultBroker: 'oanda'
  },
  {
    name: 'paradox',
    sheetId: process.env.PARADOX_SHEET_ID || '',
    range: 'Signals!A2:H', 
    defaultBroker: 'alpaca'
  }
];

export const sheetsService = new SheetsService();
