-- Migration to add passphrase support for crypto exchanges
-- Adds requiresPassphrase column to broker_types table
ALTER TABLE IF EXISTS broker_types ADD COLUMN IF NOT EXISTS requires_passphrase BOOLEAN DEFAULT FALSE;

-- Adds encryptedPassphrase column to broker_connections table
ALTER TABLE IF EXISTS broker_connections ADD COLUMN IF NOT EXISTS encrypted_passphrase TEXT;