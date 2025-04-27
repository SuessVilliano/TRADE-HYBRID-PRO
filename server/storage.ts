import * as schema from '../shared/schema';
import { 
  users,
  tradeSignals,
  type User, 
  type InsertUser,
  type TradeSignal
} from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';

// Database connection setup
// This assumes DATABASE_URL environment variable is set
const sql = neon(process.env.DATABASE_URL!);
// Define schema to make TypeScript happy
const db = drizzle(sql, { schema });

// Drizzle ORM storage implementation
export const storage = {
  schema,
  
  // Query builder
  query: {
    users: db.query.users,
    webhooks: db.query.webhooks,
    tradeSignals: db.query.tradeSignals,
  },
  
  // Trade Signal methods
  async getTradeSignals(limit = 100, marketType?: string): Promise<TradeSignal[]> {
    try {
      const query = marketType 
        ? { where: eq(tradeSignals.metadata.symbol_type, marketType) }
        : {};
      
      return db.query.tradeSignals.findMany({
        ...query,
        orderBy: (signals, { desc }) => [desc(signals.timestamp)],
        limit
      });
    } catch (error) {
      console.error('Error fetching trade signals:', error);
      return [];
    }
  },
  
  async saveTradeSignal(signal: Omit<TradeSignal, 'createdAt' | 'updatedAt'>): Promise<TradeSignal | null> {
    try {
      const [savedSignal] = await db.insert(tradeSignals)
        .values(signal)
        .returning();
      
      return savedSignal;
    } catch (error) {
      console.error('Error saving trade signal:', error);
      return null;
    }
  },
  
  async getTradeSignalsBySymbol(symbol: string, limit = 20): Promise<TradeSignal[]> {
    try {
      return db.query.tradeSignals.findMany({
        where: eq(tradeSignals.symbol, symbol),
        orderBy: (signals, { desc }) => [desc(signals.timestamp)],
        limit
      });
    } catch (error) {
      console.error(`Error fetching trade signals for symbol ${symbol}:`, error);
      return [];
    }
  },
  
  async getTradeSignalsByMarketType(marketType: string, limit = 100): Promise<TradeSignal[]> {
    try {
      // Query using SQL if metadata JSON needs to be checked
      const queryResult = await sql`
        SELECT * FROM trade_signals 
        WHERE metadata->>'market_type' = ${marketType} 
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `;
      
      return queryResult.rows as TradeSignal[];
    } catch (error) {
      console.error(`Error fetching trade signals for market type ${marketType}:`, error);
      return [];
    }
  },
  
  // CRUD operations
  async getUser(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id)
    });
  },
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.username, username)
    });
  },
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  },
  
  // Generic query methods
  insert: db.insert,
  update: db.update,
  delete: db.delete,
  
  // Expose db instance for special cases
  db,
  sql,
  
  // Raw SQL queries - modified to correctly use the neon driver
  async execute(query: string): Promise<any[]> {
    // We should directly execute the query using the sql client
    // The db.execute expects an SQLWrapper which sql`` generates, not a plain string
    const result = await sql.query(query);
    // Convert the result to an array to match the expected return type
    return Array.isArray(result) ? result : result.rows || [];
  }
};
