const fs = require('fs');
const { Client } = require('pg');

async function runSchema() {
  const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.dnhlentdcchfdxusciqk',
    password: 'hUOtasKgLzuAKTnJ',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting to Supabase PostgreSQL in ap-northeast-2...');
  await client.connect();
  console.log('Connected! Executing schema.sql...');

  try {
    await client.query(sql);
    console.log('SCHEMA APPLIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error applying schema:', err.message);
  }

  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log('Public tables created:', res.rows.map(r => r.table_name));
  await client.end();
}

runSchema();
