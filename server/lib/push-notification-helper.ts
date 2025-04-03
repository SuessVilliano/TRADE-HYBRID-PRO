/**
 * Push Notification Helper
 * 
 * This module provides utility functions for working with push notifications.
 * It can be used without the web-push library for development, and later
 * enhanced with web-push integration.
 */

import { eq } from 'drizzle-orm';
import { PushSubscription } from '../../shared/schema';
import { storage } from '../storage';

/**
 * Interface for a push notification payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, any>;
}

/**
 * Check if the VAPID keys are configured
 */
export function areVapidKeysConfigured(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  
  return !!(publicKey && privateKey);
}

/**
 * Log a push notification for development purposes
 */
export function logPushNotification(subscription: PushSubscription, payload: PushNotificationPayload): void {
  console.log('===== PUSH NOTIFICATION =====');
  console.log('Subscription:', {
    id: subscription.id,
    userId: subscription.userId,
    endpoint: subscription.endpoint
  });
  console.log('Payload:', payload);
  console.log('============================');
}

/**
 * Send a push notification to a single subscription
 * This is a placeholder that logs the notification for development
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // Log the notification for development
    logPushNotification(subscription, payload);
    
    // In production, this would use the web-push library
    // Here's what the code would look like:
    /*
    if (!areVapidKeysConfigured()) {
      throw new Error('VAPID keys are not configured');
    }
    
    const webpush = require('web-push');
    
    webpush.setVapidDetails(
      'mailto:contact@tradehybrid.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dhKey,
        auth: subscription.authKey
      }
    };
    
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );
    */
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // If the subscription has expired or is invalid, remove it from the database
    if (error.statusCode === 404 || error.statusCode === 410) {
      try {
        await storage.db.delete(storage.schema.pushSubscriptions)
          .where(eq(storage.schema.pushSubscriptions.id, subscription.id));
        console.log(`Deleted invalid subscription: ${subscription.id}`);
      } catch (dbError) {
        console.error('Error deleting invalid subscription:', dbError);
      }
    }
    
    return false;
  }
}

/**
 * Send push notifications to multiple subscriptions for a user
 */
export async function sendPushNotificationsToUser(
  userId: number,
  payload: PushNotificationPayload
): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  try {
    // Get all subscriptions for the user
    const subscriptions = await storage.db.query.pushSubscriptions.findMany({
      where: eq(storage.schema.pushSubscriptions.userId, userId)
    });
    
    if (!subscriptions.length) {
      console.log(`No push subscriptions found for user ${userId}`);
      return { total: 0, successful: 0, failed: 0 };
    }
    
    console.log(`Sending push notifications to ${subscriptions.length} subscriptions for user ${userId}`);
    
    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(subscription => sendPushNotification(subscription, payload))
    );
    
    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length;
    
    return {
      total: subscriptions.length,
      successful,
      failed
    };
  } catch (error) {
    console.error('Error sending push notifications to user:', error);
    return { total: 0, successful: 0, failed: 0 };
  }
}

/**
 * Send push notifications to all subscribers
 */
export async function sendPushNotificationsToAll(
  payload: PushNotificationPayload
): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  try {
    // Get all subscriptions
    const subscriptions = await storage.db.query.pushSubscriptions.findMany();
    
    if (!subscriptions.length) {
      console.log('No push subscriptions found');
      return { total: 0, successful: 0, failed: 0 };
    }
    
    console.log(`Sending push notifications to ${subscriptions.length} subscriptions`);
    
    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(subscription => sendPushNotification(subscription, payload))
    );
    
    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length;
    
    return {
      total: subscriptions.length,
      successful,
      failed
    };
  } catch (error) {
    console.error('Error sending push notifications to all:', error);
    return { total: 0, successful: 0, failed: 0 };
  }
}