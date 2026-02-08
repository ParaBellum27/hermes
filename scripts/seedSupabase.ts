import { serviceClient } from '../lib/supabase/service';
import type { UserPost, CreatorProfile, ContentPost, UserData } from '../types';
import { v4 as uuidv4 } from 'uuid';

async function seedSupabase() {
  console.log('Starting Supabase seeding process...');

  const userId = uuidv4(); // A consistent user ID for seeding

  // --- Sample Data Definitions ---

  const sampleCreatorProfiles: CreatorProfile[] = [
    {
      creator_id: 101,
      profile_url: 'https://linkedin.com/in/creator1',
      platform: 'linkedin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'Alice Johnson',
    },
    {
      creator_id: 102,
      profile_url: 'https://linkedin.com/in/creator2',
      platform: 'linkedin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'Bob Williams',
    },
  ];

  const sampleUserPosts: UserPost[] = [
    {
      postId: uuidv4(),
      userId: userId,
      title: 'My First Blog Post',
      rawText: 'This is the raw content of my very first post on the platform.',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 15,
    },
    {
      postId: uuidv4(),
      userId: userId,
      title: 'A Draft Idea',
      rawText: 'Just sketching out some ideas for a new feature.',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 12,
    },
  ];

  const sampleContentPosts: ContentPost[] = [
    {
      id: 201,
      title: 'LinkedIn Growth Strategies',
      author: 'Alice Johnson',
      timeAgo: '2h ago',
      isHighlighted: true,
      creatorId: 101,
      postUrl: 'https://linkedin.com/feed/update/somepost1',
      text: 'Sharing my top 5 tips for growing your audience on LinkedIn this year.',
      postedAt: new Date().toISOString(),
      postType: 'ARTICLE',
    },
    {
      id: 202,
      title: 'How to Write Engaging Hooks',
      author: 'Bob Williams',
      timeAgo: '1d ago',
      isHighlighted: false,
      creatorId: 102,
      postUrl: 'https://linkedin.com/feed/update/somepost2',
      text: 'A quick guide to crafting compelling opening lines for your content.',
      postedAt: new Date().toISOString(),
      postType: 'SHORT_POST',
    },
  ];

  const sampleUserData: UserData[] = [
    {
      id: uuidv4(),
      user_id: userId,
      key: 'settings',
      data: { theme: 'dark', notifications: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      user_id: userId,
      key: 'onboarding_status',
      data: { completed: true, step: 3 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const sampleUserFollows = [
    {
      user_id: userId,
      creator_id: 101, // User follows Alice
      created_at: new Date().toISOString(),
    },
  ];

  // --- Seeding Logic ---

  const tablesToSeed = [
    { name: 'user_data', data: sampleUserData },
    { name: 'creator_profiles', data: sampleCreatorProfiles },
    { name: 'content_posts', data: sampleContentPosts },
    { name: 'user_posts', data: sampleUserPosts },
    { name: 'user_follows', data: sampleUserFollows },
  ];

  for (const table of tablesToSeed) {
    console.log(`Seeding table: ${table.name}`);
    try {
      // Clear existing data (use with caution in production!)
      // For simplicity, deleting all. In a real scenario, you might want more granular control.
      const { error: deleteError } = await serviceClient.from(table.name).delete().neq('id', '0');
      if (deleteError && deleteError.code !== '42P01') { // 42P01 is "undefined_table"
        console.warn(`Warning: Could not clear table ${table.name}. It might not exist or 'id' column is missing. Proceeding with insert.`, deleteError.message);
      } else if (!deleteError) {
        console.log(`Cleared existing data from ${table.name}.`);
      }


      if (table.data.length > 0) {
        const { error: insertError } = await serviceClient.from(table.name).insert(table.data);
        if (insertError) {
          console.error(`Error inserting data into ${table.name}:`, insertError);
        } else {
          console.log(`Successfully inserted ${table.data.length} records into ${table.name}.`);
        }
      } else {
        console.log(`No data to insert for table ${table.name}.`);
      }
    } catch (e) {
      console.error(`An unexpected error occurred while seeding ${table.name}:`, e);
    }
  }

  console.log('Supabase seeding process completed.');
}

seedSupabase().catch(console.error);

