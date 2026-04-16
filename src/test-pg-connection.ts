import { getPool, closePool } from './db/postgres';

async function testPgConnection(): Promise<void> {
  const pool = getPool();

  try {
    console.log('Connecting to PostgreSQL...');

    // Test 1: basic connectivity
    const result = await pool.query('SELECT version()');
    console.log('PostgreSQL connected:', result.rows[0].version);

    // Test 2: pgvector extension is enabled
    const extResult = await pool.query(
      `SELECT extname FROM pg_extension WHERE extname = 'vector'`
    );
    if (extResult.rows.length > 0) {
      console.log('pgvector extension is enabled');
    } else {
      console.error('pgvector extension not found');
    }

    // Test 3: incidents table exists
    const tableResult = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = 'incidents'`
    );
    if (tableResult.rows.length > 0) {
      console.log('incidents table exists');
    } else {
      console.error('incidents table not found');
    }

  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  } finally {
    await closePool();
  }
}

testPgConnection();