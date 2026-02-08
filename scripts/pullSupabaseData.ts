import { serviceClient } from '../lib/supabase/service';
import fs from 'fs';
import path from 'path';

// Define the tables to pull data from
const tablesToPull = [
  'content',
  'creators',
  'user_data',
  'user_follows',
  'user_posts',
];

async function pullAllSupabaseData() {
  console.log('Starting to pull data from Supabase...');
  const allData: { [key: string]: any[] } = {};

  for (const tableName of tablesToPull) {
    console.log(`Pulling data from table: ${tableName}`);
    try {
      const { data, error } = await serviceClient.from(tableName).select('*');

      if (error) {
        console.error(`Error pulling data from ${tableName}:`, error);
        continue;
      }

      if (data) {
        allData[tableName] = data;
        console.log(`Successfully pulled ${data.length} records from ${tableName}.`);
      }
    } catch (e) {
      console.error(`An unexpected error occurred while pulling from ${tableName}:`, e);
    }
  }

  // Define the output file path in the temporary directory
  const tempDir = process.env.GEMINI_TEMP_DIR || '/tmp'; // Fallback for local testing
  const outputPath = path.join(tempDir, 'all_supabase_data.json');

  try {
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`All Supabase data successfully written to ${outputPath}`);
  } catch (e) {
    console.error('Error writing data to file:', e);
  }
}

pullAllSupabaseData().catch(console.error);
