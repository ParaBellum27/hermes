-- Migration: Add title column to user_posts table
-- This replaces the inefficient key-value storage in user_data table

-- Add title column to user_posts
ALTER TABLE user_posts
ADD COLUMN title TEXT;

-- Create index for faster title searches
CREATE INDEX idx_user_posts_title ON user_posts(title);

-- Add comment to document the column
COMMENT ON COLUMN user_posts.title IS 'Post title - migrated from user_data key-value storage';
