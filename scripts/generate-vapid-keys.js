/**
 * Generate VAPID Keys for Web Push Notifications
 * 
 * This script generates the necessary VAPID keys for the Web Push API.
 * These keys are used to identify the sender of push notifications.
 * 
 * Usage:
 * - Run this script to generate new VAPID keys
 * - The keys should be added to your environment variables
 * - The public key should be added to your client-side code
 * - The private key should be kept secret and used on the server
 */

const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

// Output the keys
console.log('=========== VAPID KEYS ===========');
console.log();
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log();
console.log('Private Key:');
console.log(vapidKeys.privateKey);
console.log();
console.log('==================================');
console.log();
console.log('Store these keys securely!');
console.log('Add them to your environment variables as:');
console.log('VAPID_PUBLIC_KEY="' + vapidKeys.publicKey + '"');
console.log('VAPID_PRIVATE_KEY="' + vapidKeys.privateKey + '"');
console.log();
console.log('Update your client code with the public key:');
console.log('const VAPID_PUBLIC_KEY = "' + vapidKeys.publicKey + '";');
console.log();

// Generate example environment variables file content
const envContent = `
# VAPID Keys for Web Push Notifications
# Generated on ${new Date().toISOString()}
VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"
VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"
VAPID_SUBJECT="mailto:contact@tradehybrid.com"
`;

console.log('Example .env file content:');
console.log(envContent);
console.log('==================================');