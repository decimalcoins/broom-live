-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    coin_balance INTEGER NOT NULL DEFAULT 0,
    pi_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    login_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Streams table
CREATE TABLE IF NOT EXISTS streams (
    id VARCHAR(255) PRIMARY KEY,
    host_id VARCHAR(255) NOT NULL,
    host_username VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_live BOOLEAN NOT NULL DEFAULT false,
    viewer_count INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    thumbnail_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id)
);

-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coin_cost INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    animation_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(20) NOT NULL,
    related_user_id VARCHAR(255),
    stream_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (stream_id) REFERENCES streams(id)
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(255) PRIMARY KEY,
    host_id VARCHAR(255) NOT NULL,
    host_username VARCHAR(100) NOT NULL,
    coin_amount INTEGER NOT NULL,
    pi_amount DECIMAL(10, 2) NOT NULL,
    platform_fee_percentage DECIMAL(5, 2) NOT NULL,
    platform_fee_coins INTEGER NOT NULL,
    net_pi_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    admin_notes TEXT,
    FOREIGN KEY (host_id) REFERENCES users(id)
);

-- App config table
CREATE TABLE IF NOT EXISTS app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    platform_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    pi_to_coin_rate INTEGER NOT NULL DEFAULT 314159,
    coin_to_gift_rate INTEGER NOT NULL DEFAULT 100,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (id = 1)
);

-- Insert default config
INSERT INTO app_config (id, platform_fee_percentage, pi_to_coin_rate, coin_to_gift_rate)
VALUES (1, 10.00, 314159, 100)
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_streams_host_id ON streams(host_id);
CREATE INDEX IF NOT EXISTS idx_streams_is_live ON streams(is_live);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stream_id ON transactions(stream_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_host_id ON withdrawals(host_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
