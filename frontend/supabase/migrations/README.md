# Database Migrations

This directory contains SQL migrations for the hermes database schema.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://app.supabase.com/project/fipaiaddzekbvahkiwoa
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref fipaiaddzekbvahkiwoa

# Run migrations
supabase db push
```

## Migration History

### 001_add_title_to_user_posts.sql
**Date**: 2025-12-10
**Purpose**: Add `title` column to `user_posts` table to replace inefficient key-value storage in `user_data` table.

**Changes**:
- Adds `title TEXT` column to `user_posts`
- Creates index `idx_user_posts_title` for faster searches
- Adds column comment for documentation

**Impact**:
- Improves query performance by eliminating N+1 query pattern
- Better data normalization
- Titles are now part of post records

### 002_migrate_post_titles.sql
**Date**: 2025-12-10
**Purpose**: Migrate existing post titles from `user_data` to `user_posts` table.

**Changes**:
- Moves title data from `user_data` (key-value) to `user_posts.title` column
- Optional cleanup of old `post_title:*` entries in `user_data`

**Important**:
- Run AFTER 001_add_title_to_user_posts.sql
- Verify data migration before uncommenting the DELETE statement
- The DELETE is commented out for safety - only run after verification

## Post-Migration

After running these migrations:

1. **Code Changes**: The application code has been updated to use the new `title` column:
   - `userPostService.savePostTitle()` is now deprecated (uses `updatePost({ title })` internally)
   - `userPostService.fetchPostTitle()` is now deprecated (uses `fetchPostById().title` internally)
   - `userPostService.fetchPostTitles()` is now deprecated (uses `fetchUserPosts()` internally)

2. **Verify Migration**:
   ```sql
   -- Check that titles were migrated
   SELECT COUNT(*) FROM user_posts WHERE title IS NOT NULL;

   -- Compare with old user_data entries
   SELECT COUNT(*) FROM user_data WHERE key LIKE 'post_title:%';
   ```

3. **Cleanup** (only after verification):
   ```sql
   -- Remove old title entries from user_data
   DELETE FROM user_data WHERE key LIKE 'post_title:%';
   ```

## Rollback

If you need to rollback these migrations:

```sql
-- Rollback 002: Copy titles back to user_data (if needed)
INSERT INTO user_data (user_id, key, data, updated_at)
SELECT
  user_id,
  'post_title:' || post_id::text,
  jsonb_build_object('title', title),
  NOW()
FROM user_posts
WHERE title IS NOT NULL
ON CONFLICT (user_id, key) DO NOTHING;

-- Rollback 001: Remove title column
DROP INDEX IF EXISTS idx_user_posts_title;
ALTER TABLE user_posts DROP COLUMN title;
```
