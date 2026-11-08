const { Client } = require('pg');

async function seed() {
  const pg = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.dnhlentdcchfdxusciqk',
    password: 'hUOtasKgLzuAKTnJ',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await pg.connect();
  console.log('Connected to PG for direct user seeding...');

  await pg.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  const users = [
    { email: 'driver@safeguard.com', password: 'Password123!', name: 'K. Rajesh (Lead Driver)', role: 'driver' },
    { email: 'moderator@safeguard.com', password: 'Password123!', name: 'S. Varma (Fleet Controller)', role: 'moderator' },
    { email: 'admin@safeguard.com', password: 'Password123!', name: 'Dr. A. Sharma (Chief Transport Officer)', role: 'admin' }
  ];

  for (const u of users) {
    console.log(`Processing auth user: ${u.email}...`);
    const existing = await pg.query('SELECT id FROM auth.users WHERE email = $1', [u.email]);
    let userId;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await pg.query(`
        UPDATE auth.users 
        SET encrypted_password = crypt($2, gen_salt('bf')),
            email_confirmed_at = now(),
            raw_user_meta_data = json_build_object('full_name', $3::text, 'role', $4::text)
        WHERE id = $1;
      `, [userId, u.password, u.name, u.role]);
      console.log(`Updated auth.users for ${u.email} (UUID: ${userId})`);
    } else {
      const inserted = await pg.query(`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}',
          json_build_object('full_name', $3::text, 'role', $4::text),
          now(),
          now(),
          ''
        )
        RETURNING id;
      `, [u.email, u.password, u.name, u.role]);
      userId = inserted.rows[0].id;
      console.log(`Inserted auth.users for ${u.email} (UUID: ${userId})`);
    }

    // Upsert into public.profiles
    await pg.query(`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES ($1, $2, $3, $4::user_role)
      ON CONFLICT (id) DO UPDATE SET full_name = $3, role = $4::user_role;
    `, [userId, u.email, u.name, u.role]);

    console.log(`Profile synced for: ${u.email}`);
  }

  // Set up Moderator Group & Assign Driver
  console.log('Linking Moderator Group & Driver Assignment...');
  const modRes = await pg.query("SELECT id FROM profiles WHERE role = 'moderator' LIMIT 1");
  const driverRes = await pg.query("SELECT id FROM profiles WHERE role = 'driver' LIMIT 1");
  const vehicleRes = await pg.query("SELECT id FROM vehicles LIMIT 1");

  if (modRes.rows.length > 0 && driverRes.rows.length > 0) {
    const modId = modRes.rows[0].id;
    const driverId = driverRes.rows[0].id;

    let groupRes = await pg.query("SELECT id FROM moderator_groups WHERE moderator_id = $1 LIMIT 1", [modId]);
    if (groupRes.rows.length === 0) {
      groupRes = await pg.query(`
        INSERT INTO moderator_groups (name, description, moderator_id, max_drivers)
        VALUES ('Telangana Express Sector A', 'Rapid Transit Fleet - Hyderabad Urban Zone', $1, 35)
        RETURNING id;
      `, [modId]);
    }
    const groupId = groupRes.rows[0].id;

    await pg.query(`
      INSERT INTO group_members (group_id, driver_id)
      VALUES ($1, $2)
      ON CONFLICT (group_id, driver_id) DO NOTHING;
    `, [groupId, driverId]);

    if (vehicleRes.rows.length > 0) {
      const vehicleId = vehicleRes.rows[0].id;
      await pg.query(`
        INSERT INTO vehicle_assignments (vehicle_id, driver_id, is_active)
        VALUES ($1, $2, true)
        ON CONFLICT DO NOTHING;
      `, [vehicleId, driverId]);
    }
    console.log('Group assignments and vehicle allocation successfully linked!');
  }

  console.log('Seeding fully completed!');
  await pg.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
