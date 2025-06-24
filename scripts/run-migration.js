import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migration to add category field to tasks table...');
    
    // Read the migration SQL
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20240321000001_add_category_to_tasks.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL:', migrationSQL);
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log('Trying alternative approach...');
      
      // Add category column
      const { error: alterError } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);
      
      if (alterError) {
        console.error('Error checking table structure:', alterError);
      } else {
        console.log('Table structure check successful');
      }
      
      // Try to add the column using a different approach
      const { error: addColumnError } = await supabase
        .rpc('add_category_column');
      
      if (addColumnError) {
        console.log('RPC approach failed, trying direct SQL...');
        
        // Create a function to add the column
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION add_category_column()
          RETURNS void AS $$
          BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
            CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);
          END;
          $$ LANGUAGE plpgsql;
        `;
        
        const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        
        if (funcError) {
          console.error('Could not create function:', funcError);
          console.log('Please run the following SQL manually in your Supabase dashboard:');
          console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT \'Other\';');
          console.log('CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);');
        } else {
          console.log('Function created successfully');
          
          // Execute the function
          const { error: execError } = await supabase.rpc('add_category_column');
          if (execError) {
            console.error('Error executing function:', execError);
          } else {
            console.log('Migration completed successfully!');
          }
        }
      } else {
        console.log('Migration completed successfully!');
      }
    } else {
      console.log('Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nPlease run the following SQL manually in your Supabase dashboard:');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT \'Other\';');
    console.log('CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);');
  }
}

runMigration(); 