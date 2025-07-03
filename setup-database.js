// Setup database tables in Neon
import { Pool } from '@neondatabase/serverless';

async function setupDatabase() {
  try {
    const connectionString = 'postgresql://neondb_owner:npg_fXFI6qpea1Mr@ep-muddy-mud-a9vbi2k0-pooler.gwc.azure.neon.tech/meeting_summarizer?sslmode=require';
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    
    console.log('🔧 Setting up database tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('✅ Users table created');
    
    // Create meetings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'file',
        source_url TEXT,
        processing_status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        summary TEXT,
        key_points JSONB,
        decisions JSONB,
        next_steps JSONB,
        action_items JSONB,
        sentiment_analysis JSONB,
        speaker_analysis JSONB,
        duration INTEGER,
        participant_count INTEGER,
        overall_sentiment TEXT
      );
    `);
    
    console.log('✅ Meetings table created');
    
    // Check tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Database tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  }
}

setupDatabase();