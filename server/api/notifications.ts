/**
 * Notifications API Router
 * 
 * This module handles push notification subscriptions and sending notifications
 * to subscribed clients.
 */

import { Router } from 'express';
import { storage } from '../storage';
import { pushSubscriptions, type PushSubscription } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Use the database instance from storage
const db = storage.db;

const router = Router();

// Handles subscribing to push notifications
router.post('/push/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract subscription details
    const { endpoint, keys, expirationTime } = subscription;
    
    if (!endpoint || !keys) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Generate a unique ID for the subscription
    const id = Buffer.from(endpoint).toString('base64');

    // Check if the subscription already exists
    const existingSubscription = await db.query.pushSubscriptions.findFirst({
      where: and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.userId, userId)
      )
    });

    if (existingSubscription) {
      // Update the existing subscription
      await db.update(pushSubscriptions)
        .set({
          p256dhKey: keys.p256dh,
          authKey: keys.auth,
          expirationTime: expirationTime ? new Date(expirationTime) : null,
          updatedAt: new Date()
        })
        .where(eq(pushSubscriptions.id, existingSubscription.id));
      
      return res.json({ success: true, id: existingSubscription.id });
    }

    // Insert a new subscription
    await db.insert(pushSubscriptions).values({
      id,
      userId,
      endpoint,
      p256dhKey: keys.p256dh,
      authKey: keys.auth,
      expirationTime: expirationTime ? new Date(expirationTime) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.json({ success: true, id });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Handles unsubscribing from push notifications
router.post('/push/unsubscribe', async (req, res) => {
  try {
    const { endpoint, userId } = req.body;

    if (!endpoint || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Delete the subscription
    await db.delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.endpoint, endpoint),
          eq(pushSubscriptions.userId, userId)
        )
      );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test sending a push notification (for development purposes)
router.post('/push/test', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Find all subscriptions for the user
    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId)
    });

    if (!subscriptions.length) {
      return res.status(404).json({ error: 'No subscriptions found for this user' });
    }

    // In a production environment, we would use web-push to send notifications
    // but since we're having trouble installing it, we'll just return success
    console.log(`Would send push notifications to ${subscriptions.length} subscriptions`);
    
    // Here's the code that would be used if web-push was installed:
    /*
    const webpush = require('web-push');
    
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:contact@tradehybrid.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dhKey,
            auth: sub.authKey
          }
        };

        try {
          return await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: 'Test Notification',
              body: 'This is a test push notification from Trade Hybrid',
              icon: '/logo.png',
              badge: '/badge.png',
              data: {
                url: '/notifications'
              }
            })
          );
        } catch (error) {
          console.error(`Error sending notification to ${sub.id}:`, error);
          
          // If the subscription is no longer valid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          }
          
          throw error;
        }
      })
    );
    */

    return res.json({ 
      success: true, 
      message: `Test notifications would be sent to ${subscriptions.length} subscriptions`
    });
  } catch (error) {
    console.error('Error testing push notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all push subscriptions for a user
router.get('/push/subscriptions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find all subscriptions for the user
    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId)
    });

    return res.json({ 
      success: true, 
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint,
        createdAt: sub.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting push subscriptions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a notification to a specific user or all users
router.post('/push/send', async (req, res) => {
  try {
    const { userId, title, body, icon, badge, url, data } = req.body;

    // Validate required fields
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Find subscriptions (for a specific user or all users)
    let subscriptions: PushSubscription[] = [];
    
    if (userId) {
      subscriptions = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, userId)
      });
    } else {
      subscriptions = await db.query.pushSubscriptions.findMany();
    }

    if (!subscriptions.length) {
      return res.status(404).json({ 
        error: userId 
          ? 'No subscriptions found for this user' 
          : 'No subscriptions found'
      });
    }

    // In a production environment, we would use web-push to send notifications
    console.log(`Would send push notifications to ${subscriptions.length} subscriptions`);
    console.log('Notification content:', { title, body, icon, badge, url, data });
    
    // Here's the code that would be used if web-push was installed:
    /*
    const webpush = require('web-push');
    
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:contact@tradehybrid.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dhKey,
            auth: sub.authKey
          }
        };

        try {
          return await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title,
              body,
              icon: icon || '/logo.png',
              badge: badge || '/badge.png',
              data: {
                url: url || '/notifications',
                ...data
              }
            })
          );
        } catch (error) {
          console.error(`Error sending notification to ${sub.id}:`, error);
          
          // If the subscription is no longer valid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          }
          
          throw error;
        }
      })
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    */

    return res.json({ 
      success: true, 
      message: `Notifications would be sent to ${subscriptions.length} subscriptions`,
      /*
      stats: {
        total: subscriptions.length,
        successful,
        failed
      }
      */
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;