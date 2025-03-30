
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { accounts } from '../schema';

export class InternalBankService {
  // Get user's internal bank balance
  async getBalance(userId: string): Promise<number> {
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.userId, userId)
    });
    return account?.balance || 0;
  }

  // Update user's internal balance
  async updateBalance(userId: string, amount: number): Promise<void> {
    await db.insert(accounts).values({
      userId,
      balance: amount
    }).onConflictDoUpdate({
      target: [accounts.userId],
      set: { balance: amount }
    });
  }

  // Validate if user has sufficient funds
  async validateFunds(userId: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= requiredAmount;
  }
}
