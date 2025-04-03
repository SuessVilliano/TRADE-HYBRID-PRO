import { Router, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';

// Extend the Express Request type to include userId in session
declare module 'express-session' {
  interface Session {
    userId?: number | string;
  }
}

// Use environment variables for database connection
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

// Create Neon client for raw SQL queries
const sql = neon(connectionString);

const router = Router();

// Get all subscriptions for a user
router.get('/', async (req, res) => {
  try {
    // For demo purposes, we'll use a default user ID if not authenticated
    let userId = req.session.userId || req.query.userId?.toString();
    
    // For demo, use a default user ID if not provided (this is for testing only)
    if (!userId) {
      userId = 'demo-user-123'; // Default demo user ID
      console.log('Using demo user ID for fetching subscriptions: demo-user-123');
    }
    
    const rows = await sql`
      SELECT * FROM signal_subscriptions 
      WHERE user_id = ${userId} 
      ORDER BY created_at ASC
    `;
    
    res.json({ subscriptions: rows });
  } catch (error) {
    console.error('Error getting signal subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch signal subscriptions' });
  }
});

// Subscribe to a signal provider
router.post('/subscribe', async (req, res) => {
  try {
    const { providerId, symbol, autoTrade, autoTradeSettings } = req.body;
    // For demo purposes, we'll use a default user ID if not authenticated
    let userId = req.session.userId || req.query.userId?.toString();
    
    // For demo, use a default user ID if not provided (this is for testing only)
    if (!userId) {
      userId = 'demo-user-123'; // Default demo user ID
      console.log('Using demo user ID for subscription: demo-user-123');
    }
    
    if (!providerId) {
      return res.status(400).json({ error: 'Provider ID is required' });
    }
    
    // Check if subscription already exists
    let existingSubscriptions;
    if (symbol) {
      existingSubscriptions = await sql`
        SELECT * FROM signal_subscriptions 
        WHERE user_id = ${userId} 
        AND provider_id = ${providerId} 
        AND symbol = ${symbol}
      `;
    } else {
      existingSubscriptions = await sql`
        SELECT * FROM signal_subscriptions 
        WHERE user_id = ${userId} 
        AND provider_id = ${providerId} 
        AND symbol IS NULL
      `;
    }
    
    const existingSubscription = existingSubscriptions.length > 0 ? existingSubscriptions[0] : null;
    
    // If already subscribed and active, return that subscription
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.json({ 
        subscription: existingSubscription,
        message: 'Already subscribed to this provider' 
      });
    }
    
    // If exists but not active, reactivate
    if (existingSubscription) {
      const autoTradeValue = autoTrade || false;
      const updated = await sql`
        UPDATE signal_subscriptions 
        SET status = 'active', 
            auto_trade = ${autoTradeValue}, 
            auto_trade_settings = ${autoTradeSettings || null}, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${existingSubscription.id} 
        RETURNING *
      `;
      
      return res.json({ 
        subscription: updated[0],
        message: 'Subscription reactivated successfully' 
      });
    }
    
    // Create new subscription
    const id = uuidv4();
    const autoTradeValue = autoTrade || false;
    const result = await sql`
      INSERT INTO signal_subscriptions (
        id, user_id, provider_id, symbol, status, 
        notifications_enabled, auto_trade, auto_trade_settings,
        created_at, updated_at
      ) 
      VALUES (
        ${id}, ${userId}, ${providerId}, ${symbol || null}, 'active', 
        TRUE, ${autoTradeValue}, ${autoTradeSettings || null}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    
    res.status(201).json({ 
      subscription: result[0],
      message: 'Successfully subscribed to provider' 
    });
  } catch (error) {
    console.error('Error subscribing to signal provider:', error);
    res.status(500).json({ error: 'Failed to subscribe to signal provider' });
  }
});

// Unsubscribe from a signal provider
router.post('/unsubscribe', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    // For demo purposes, we'll use a default user ID if not authenticated
    let userId = req.session.userId || req.query.userId?.toString();
    
    // For demo, use a default user ID if not provided (this is for testing only)
    if (!userId) {
      userId = 'demo-user-123'; // Default demo user ID
      console.log('Using demo user ID for unsubscribe: demo-user-123');
    }
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }
    
    // Ensure subscription belongs to user
    const subscriptions = await sql`
      SELECT * FROM signal_subscriptions 
      WHERE id = ${subscriptionId} AND user_id = ${userId}
    `;
    
    if (!subscriptions.length) {
      return res.status(404).json({ error: 'Subscription not found or not owned by user' });
    }
    
    // Update status to cancelled instead of deleting
    const updated = await sql`
      UPDATE signal_subscriptions 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${subscriptionId} 
      RETURNING *
    `;
    
    res.json({ 
      subscription: updated[0],
      message: 'Successfully unsubscribed from provider' 
    });
  } catch (error) {
    console.error('Error unsubscribing from signal provider:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from signal provider' });
  }
});

// Update subscription settings (e.g., enable/disable notifications or auto-trading)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { notificationsEnabled, autoTrade, autoTradeSettings } = req.body;
    // For demo purposes, we'll use a default user ID if not authenticated
    let userId = req.session.userId || req.query.userId?.toString();
    
    // For demo, use a default user ID if not provided (this is for testing only)
    if (!userId) {
      userId = 'demo-user-123'; // Default demo user ID
      console.log('Using demo user ID for updating subscription: demo-user-123');
    }
    
    // Ensure subscription belongs to user
    const subscriptions = await sql`
      SELECT * FROM signal_subscriptions 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    if (!subscriptions.length) {
      return res.status(404).json({ error: 'Subscription not found or not owned by user' });
    }
    
    // Build the update parameters 
    let updated;
    
    // Check which fields to update and run appropriate query
    if (notificationsEnabled !== undefined && autoTrade !== undefined && autoTradeSettings !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          notifications_enabled = ${notificationsEnabled},
          auto_trade = ${autoTrade},
          auto_trade_settings = ${autoTradeSettings},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (notificationsEnabled !== undefined && autoTrade !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          notifications_enabled = ${notificationsEnabled},
          auto_trade = ${autoTrade},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (notificationsEnabled !== undefined && autoTradeSettings !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          notifications_enabled = ${notificationsEnabled},
          auto_trade_settings = ${autoTradeSettings},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (autoTrade !== undefined && autoTradeSettings !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          auto_trade = ${autoTrade},
          auto_trade_settings = ${autoTradeSettings},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (notificationsEnabled !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          notifications_enabled = ${notificationsEnabled},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (autoTrade !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          auto_trade = ${autoTrade},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (autoTradeSettings !== undefined) {
      updated = await sql`
        UPDATE signal_subscriptions 
        SET 
          auto_trade_settings = ${autoTradeSettings},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // Nothing to update except timestamp
      updated = await sql`
        UPDATE signal_subscriptions 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    }
    
    res.json({ 
      subscription: updated[0],
      message: 'Subscription settings updated successfully' 
    });
  } catch (error) {
    console.error('Error updating subscription settings:', error);
    res.status(500).json({ error: 'Failed to update subscription settings' });
  }
});

export default router;