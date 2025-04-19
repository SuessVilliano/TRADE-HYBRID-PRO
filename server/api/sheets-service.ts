import { google } from 'googleapis';
import { db } from '../lib/db';
import { BrokerService } from '../lib/services/broker-service';

// Define types locally since we can't import them
export interface SheetsSignal {
  symbol: string;
  type: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: Date;
}

export interface SignalSource {
  name: string;
  sheetId: string;
  range: string;
  defaultBroker: string;
}


export class SheetsService {
  private sheets;
  private broker: BrokerService;

  constructor() {
    this.sheets = google.sheets({ version: 'v4' });
    this.broker = new BrokerService();
  }

  async processSignals(spreadsheetId: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Signals!A:F',
      });

      const rows = response.data.values;
      if (rows?.length) {
        const signals = rows.map(row => ({
          symbol: row[0],
          type: row[1],
          entry: parseFloat(row[2]),
          stopLoss: parseFloat(row[3]),
          takeProfit: parseFloat(row[4]),
          timestamp: new Date(row[5])
        }));

        await this.broker.processSignalBatch(signals);
      }
    } catch (error) {
      console.error('Error processing signals:', error);
    }
  }
}


//Keeping this part, as it might be used elsewhere
export const SIGNAL_SOURCES: SignalSource[] = [
  {
    name: 'solaris',
    sheetId: '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8',
    range: 'Signals!A2:H',
    defaultBroker: 'oanda'
  },
  {
    name: 'paradox',
    sheetId: '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8',
    range: 'Signals!A2:H',
    defaultBroker: 'alpaca'
  },
  {
    name: 'hybrid',
    sheetId: '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8',
    range: 'Signals!A2:H',
    defaultBroker: 'ninjatrader'
  }
];

//This is needed by the signals.ts module
export const sheetsService = new SheetsService();