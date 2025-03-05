import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log(`
==========================================================
IMPORTANT: You need to execute the SQL schema manually
==========================================================

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Create a new query
5. Copy and paste the schema from: ${schemaPath}
6. Run the query

After executing the schema, you can run the seeder:
npm run seed

==========================================================
`);
    
    // Write schema to a file for easy access
    const outputPath = path.join(process.cwd(), 'schema.sql');
    fs.writeFileSync(outputPath, schema);
    console.log(`Schema has been written to: ${outputPath}`);
    
    console.log('✅ Please execute the schema manually in Supabase SQL Editor');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    process.exit(1);
  }
}

initializeDatabase(); 