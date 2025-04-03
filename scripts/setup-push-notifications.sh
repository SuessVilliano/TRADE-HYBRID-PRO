#!/bin/bash

# Setup Push Notifications Script
# This script installs the web-push library and generates VAPID keys for web push notifications

# Check if web-push is installed globally
if ! npm list -g web-push > /dev/null 2>&1; then
  echo "Installing web-push globally..."
  npm install -g web-push
fi

# Generate VAPID keys
echo "Generating VAPID keys..."
VAPID_KEYS=$(web-push generate-vapid-keys --json)

# Extract the keys
PUBLIC_KEY=$(echo $VAPID_KEYS | grep -o '"publicKey":"[^"]*"' | cut -d'"' -f4)
PRIVATE_KEY=$(echo $VAPID_KEYS | grep -o '"privateKey":"[^"]*"' | cut -d'"' -f4)

# Output the keys
echo "=========== VAPID KEYS ==========="
echo ""
echo "Public Key:"
echo $PUBLIC_KEY
echo ""
echo "Private Key:"
echo $PRIVATE_KEY
echo ""
echo "=================================="
echo ""
echo "Store these keys securely!"
echo "Add them to your .env file as:"
echo "VAPID_PUBLIC_KEY=\"$PUBLIC_KEY\""
echo "VAPID_PRIVATE_KEY=\"$PRIVATE_KEY\""
echo "VAPID_SUBJECT=\"mailto:contact@tradehybrid.com\""
echo ""

# Update the client-side code with the public key
echo "Updating client-side code with the public key..."
sed -i "s|const VAPID_PUBLIC_KEY = '.*';|const VAPID_PUBLIC_KEY = '$PUBLIC_KEY';|" client/src/lib/services/push-notification-service.ts

# Update .env file if it exists
if [ -f .env ]; then
  echo "Updating .env file..."
  
  # Remove existing VAPID keys if they exist
  sed -i '/VAPID_PUBLIC_KEY/d' .env
  sed -i '/VAPID_PRIVATE_KEY/d' .env
  sed -i '/VAPID_SUBJECT/d' .env
  
  # Add new VAPID keys
  echo "" >> .env
  echo "# VAPID Keys for Web Push Notifications" >> .env
  echo "# Generated on $(date)" >> .env
  echo "VAPID_PUBLIC_KEY=\"$PUBLIC_KEY\"" >> .env
  echo "VAPID_PRIVATE_KEY=\"$PRIVATE_KEY\"" >> .env
  echo "VAPID_SUBJECT=\"mailto:contact@tradehybrid.com\"" >> .env
  
  echo "Updated .env file with VAPID keys"
else
  # Create new .env file with VAPID keys
  echo "Creating .env file with VAPID keys..."
  
  echo "# VAPID Keys for Web Push Notifications" > .env
  echo "# Generated on $(date)" >> .env
  echo "VAPID_PUBLIC_KEY=\"$PUBLIC_KEY\"" >> .env
  echo "VAPID_PRIVATE_KEY=\"$PRIVATE_KEY\"" >> .env
  echo "VAPID_SUBJECT=\"mailto:contact@tradehybrid.com\"" >> .env
  
  echo "Created .env file with VAPID keys"
fi

echo ""
echo "Setup complete!"
echo "Push notifications are now configured and ready to use."