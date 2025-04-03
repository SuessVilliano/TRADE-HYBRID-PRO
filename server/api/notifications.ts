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
import {
  areVapidKeysConfigured,
  sendPushNotificationsToUser,
  sendPushNotificationsToAll
} from '../lib/push-notification-helper';

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
        eq(storage.schema.pushSubscriptions.endpoint, endpoint),
        eq(storage.schema.pushSubscriptions.userId, userId)
      )
    });

    if (existingSubscription) {
      // Update the existing subscription
      await db.update(storage.schema.pushSubscriptions)
        .set({
          p256dhKey: keys.p256dh,
          authKey: keys.auth,
          expirationTime: expirationTime ? new Date(expirationTime) : null,
          updatedAt: new Date()
        })
        .where(eq(storage.schema.pushSubscriptions.id, existingSubscription.id));
      
      return res.json({ success: true, id: existingSubscription.id });
    }

    // Insert a new subscription
    await db.insert(storage.schema.pushSubscriptions).values({
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
    await db.delete(storage.schema.pushSubscriptions)
      .where(
        and(
          eq(storage.schema.pushSubscriptions.endpoint, endpoint),
          eq(storage.schema.pushSubscriptions.userId, userId)
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

    // Check if VAPID keys are configured
    if (!areVapidKeysConfigured()) {
      console.warn('VAPID keys are not configured. Push notifications will be logged only.');
    }

    // Send a test notification
    const result = await sendPushNotificationsToUser(userId, {
      title: 'Test Notification',
      body: 'This is a test push notification from Trade Hybrid',
      icon: '/logo.png',
      badge: '/badge.png',
      data: {
        url: '/notifications'
      }
    });

    if (result.total === 0) {
      return res.status(404).json({ error: 'No subscriptions found for this user' });
    }

    return res.json({
      success: true,
      message: `Test notifications sent to ${result.successful} of ${result.total} subscriptions`,
      stats: result
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
      where: eq(storage.schema.pushSubscriptions.userId, userId)
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

    // Check if VAPID keys are configured
    if (!areVapidKeysConfigured()) {
      console.warn('VAPID keys are not configured. Push notifications will be logged only.');
    }

    // Prepare the notification payload
    const payload = {
      title,
      body,
      icon: icon || '/logo.png',
      badge: badge || '/badge.png',
      url: url || '/notifications',
      data
    };

    // Send notifications to a specific user or all users
    let result;
    if (userId) {
      result = await sendPushNotificationsToUser(userId, payload);
    } else {
      result = await sendPushNotificationsToAll(payload);
    }

    if (result.total === 0) {
      return res.status(404).json({ 
        error: userId 
          ? 'No subscriptions found for this user' 
          : 'No subscriptions found'
      });
    }

    return res.json({ 
      success: true, 
      message: `Notifications sent to ${result.successful} of ${result.total} subscriptions`,
      stats: result
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;