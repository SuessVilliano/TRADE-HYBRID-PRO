-- Add new columns to users table for Whop integration

-- Check if columns exist before adding them
DO $$
BEGIN
    -- Add whopProductId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='whop_product_id') THEN
        ALTER TABLE users ADD COLUMN whop_product_id TEXT;
    END IF;

    -- Add whopAccessPassId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='whop_access_pass_id') THEN
        ALTER TABLE users ADD COLUMN whop_access_pass_id TEXT;
    END IF;

    -- Add whopCustomerId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='whop_customer_id') THEN
        ALTER TABLE users ADD COLUMN whop_customer_id TEXT;
    END IF;

    -- Add whopMembershipExpiresAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='whop_membership_expires_at') THEN
        ALTER TABLE users ADD COLUMN whop_membership_expires_at TEXT;
    END IF;

    -- Add discord if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='discord') THEN
        ALTER TABLE users ADD COLUMN discord TEXT;
    END IF;

    -- Add profileImage if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='profile_image') THEN
        ALTER TABLE users ADD COLUMN profile_image TEXT;
    END IF;
    
END$$;