// Quick database connection test
import { Pool } from '@neondatabase/serverless';

async function testConnection() {
  try {
    // Direct connection string for testing
    const connectionString = 'postgresql://neondb_owner:npg_fXFI6qpea1Mr@ep-muddy-mud-a9vbi2k0-pooler.gwc.azure.neon.tech/meeting_summarizer?sslmode=require';
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    
    console.log('✅ Successfully connected to Neon database!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Current database time:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    
    console.log('🎉 Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();