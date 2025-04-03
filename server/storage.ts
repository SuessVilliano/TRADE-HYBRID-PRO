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
};
