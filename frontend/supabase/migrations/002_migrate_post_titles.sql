-- Migration: Migrate existing post titles from user_data to user_posts
-- This is a data migration to move titles from the key-value table to the proper column

-- Update user_posts with titles from user_data
UPDATE user_posts up
SET title = (ud.data->>'title')
FROM user_data ud
WHERE ud.key = 'post_title:' || up.post_id::text
  AND ud.user_id = up.user_id
  AND ud.data->>'title' IS NOT NULL;

-- Optional: Clean up old title entries from user_data after successful migration
-- Uncomment the following line after verifying the migration was successful:
-- DELETE FROM user_data WHERE key LIKE 'post_title:%';
