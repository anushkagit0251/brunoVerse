-- BrunoVerse Database Schema Fix & Migration
-- Ensures column naming conforms with MariaDB/MySQL reserved word rules and eliminates truncation

-- 1. Rescue Requests: animal_condition column (avoids MariaDB reserved keyword 'condition')
ALTER TABLE rescue_requests ADD COLUMN IF NOT EXISTS animal_condition VARCHAR(255) DEFAULT NULL;

-- 2. Extended TEXT columns for URLs and Base64 media previews
ALTER TABLE animals MODIFY COLUMN photo_url TEXT;
ALTER TABLE users MODIFY COLUMN avatar_url TEXT;
ALTER TABLE rescue_requests MODIFY COLUMN photo_url TEXT;
ALTER TABLE community_posts MODIFY COLUMN photo_url TEXT;
ALTER TABLE community_posts MODIFY COLUMN video_url TEXT;
