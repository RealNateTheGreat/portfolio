import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join, basename } from 'path';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://acetiphsbtfahqnphgbe.supabase.co';
// Updated service role key for the new project
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZXRpcGhzYnRmYWhxbnBoZ2JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc5NDc5NSwiZXhwIjoyMDU2MzcwNzk1fQ.MlQfacbIMAGFvHMTXlpxkl1NGxzUk4Q7IQTUd-5CANU';

// Create a Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-migration-script',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  }
});

async function applyMigration() {
  try {
    console.log('Applying Supabase migrations...');
    
    // Path to migrations directory
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    
    // Read all migration files and sort them alphabetically
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    if (sqlFiles.length === 0) {
      console.log('No SQL migration files found.');
      return;
    }
    
    console.log(`Found ${sqlFiles.length} migration files:`);
    sqlFiles.forEach(file => console.log(` - ${file}`));
    
    // Create tracking table if it doesn't exist
    await supabase.rpc('create_migration_tracking_table', {}, { count: 'exact' })
      .catch(() => {
        // If the RPC doesn't exist, create the table directly
        return supabase.sql(`
          CREATE TABLE IF NOT EXISTS "_migrations" (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            applied_at TIMESTAMPTZ DEFAULT now() NOT NULL
          );
        `);
      });

    // Get applied migrations
    const { data: appliedMigrations, error: fetchError } = await supabase
      .from('_migrations')
      .select('name');
    
    if (fetchError) {
      // If the table doesn't exist yet, start with an empty list
      console.log('Creating migration tracking table...');
      await supabase.sql(`
        CREATE TABLE IF NOT EXISTS "_migrations" (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          applied_at TIMESTAMPTZ DEFAULT now() NOT NULL
        );
      `);
    }
    
    const appliedNames = (appliedMigrations || []).map(row => row.name);
    console.log('Already applied migrations:', appliedNames.length ? appliedNames.join(', ') : 'None');
    
    // Apply migrations in order
    let appliedCount = 0;
    
    for (const file of sqlFiles) {
      const migrationName = basename(file, '.sql');
      
      // Skip if already applied
      if (appliedNames.includes(migrationName)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }
      
      console.log(`Applying migration: ${file}...`);
      
      // Read the SQL content
      const sqlContent = await fs.readFile(join(migrationsDir, file), 'utf-8');
      
      // Apply the migration
      const { error } = await supabase.sql(sqlContent);
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      }
      
      // Record the migration as applied
      const { error: recordError } = await supabase
        .from('_migrations')
        .insert({ name: migrationName });
      
      if (recordError) {
        console.error(`Error recording migration ${file}:`, recordError);
        throw recordError;
      }
      
      console.log(`Successfully applied migration: ${file}`);
      appliedCount++;
    }
    
    console.log(`Migration process completed. Applied ${appliedCount} new migrations.`);
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();