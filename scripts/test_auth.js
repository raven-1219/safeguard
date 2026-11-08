const { Client } = require('pg');

async function test() {
  const pg = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.dnhlentdcchfdxusciqk',
    password: 'hUOtasKgLzuAKTnJ',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await pg.connect();

  const cols = await pg.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'instances'");
  console.log('auth.instances columns:', cols.rows);

  await pg.end();
}

test().catch(console.error);
