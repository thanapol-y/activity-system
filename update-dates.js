const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'tramway.proxy.rlwy.net',
    port: 18061,
    user: 'root',
    password: 'gteKJElKZmxDMKPtLgvZtgOUsvTkIKrP',
    database: 'activity_system'
  });

  console.log('Connected to Railway MySQL');

  try {
    // 1. Add Activity_Hours column if not exists
    console.log('Adding Activity_Hours column...');
    try {
      await connection.execute(`
        ALTER TABLE activity ADD COLUMN Activity_Hours INT DEFAULT 3 AFTER Maximum_Capacity
      `);
      console.log('Column added');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column already exists, skipping');
      } else {
        throw e;
      }
    }

    // 2. Set hours for existing activities
    console.log('Setting hours for existing activities...');
    await connection.execute(`UPDATE activity SET Activity_Hours = 3 WHERE Activity_ID = 'Act001'`);
    await connection.execute(`UPDATE activity SET Activity_Hours = 4 WHERE Activity_ID = 'Act002'`);
    await connection.execute(`UPDATE activity SET Activity_Hours = 6 WHERE Activity_ID = 'Act003'`);
    console.log('Hours set for Act001-Act003');

    // 3. Delete test/test2 activities (and their registrations/check-ins first)
    console.log('Deleting test activities...');
    
    // Get test activity IDs
    const [testActs] = await connection.execute(
      `SELECT Activity_ID FROM activity WHERE Activity_Name LIKE 'test%'`
    );
    console.log(`Found ${testActs.length} test activities`);

    for (const act of testActs) {
      const id = act.Activity_ID;
      // Delete check-ins
      await connection.execute(`DELETE FROM check_in WHERE Activity_ID = ?`, [id]);
      // Delete registrations
      await connection.execute(`DELETE FROM registration WHERE Activity_ID = ?`, [id]);
      // Delete activity assignments
      try {
        await connection.execute(`DELETE FROM activity_assignment WHERE Activity_ID = ?`, [id]);
      } catch (e) { /* table might not exist */ }
      // Delete activity
      await connection.execute(`DELETE FROM activity WHERE Activity_ID = ?`, [id]);
      console.log(`Deleted activity: ${id} (${act.Activity_Name || id})`);
    }

    console.log('\n\u2705 Migration completed successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

migrate();
