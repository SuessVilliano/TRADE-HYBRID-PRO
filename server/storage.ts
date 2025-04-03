import { users, userWebhooks, type User, type InsertUser, type UserWebhook } from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';

// Database connection setup
// This assumes DATABASE_URL environment variable is set
const sql = neon(process.env.DATABASE_URL!);
// Define schema to make TypeScript happy
const db = drizzle(sql, { schema: { users, userWebhooks } });

// Drizzle ORM storage implementation
export const storage = {
  schema: {
    users,
    userWebhooks,
  },
  
  // Query builder
  query: {
    users: db.query.users,
    userWebhooks: db.query.userWebhooks,
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
