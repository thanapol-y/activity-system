const mysql = require('mysql2/promise');

async function updateDates() {
  // Railway MySQL connection - ใช้ข้อมูลจาก Railway Connect tab
  const connection = await mysql.createConnection({
    host: 'tramway.proxy.rlwy.net',
    port: 18061,
    user: 'root',
    password: 'gteKJElKZmxDMKPtLgvZtgOUsvTkIKrP',
    database: 'activity_system'
  });

  console.log('Connected to Railway MySQL');

  try {
    // Update Activity dates
    console.log('Updating activity dates...');
    
    await connection.execute(`
      UPDATE activity SET 
        Activity_Date = '2026-01-20',
        Deadline = '2026-01-19 10:00:00'
      WHERE Activity_ID = 'Act001'
    `);
    console.log('Act001 updated');

    await connection.execute(`
      UPDATE activity SET 
        Activity_Date = '2026-02-03',
        Deadline = '2026-02-02 08:00:00'
      WHERE Activity_ID = 'Act002'
    `);
    console.log('Act002 updated');

    await connection.execute(`
      UPDATE activity SET 
        Activity_Date = '2026-03-04',
        Deadline = '2026-02-28 12:00:00'
      WHERE Activity_ID = 'Act003'
    `);
    console.log('Act003 updated');

    // Update registration dates (if year is 2569)
    console.log('Updating registration dates...');
    const [regResult] = await connection.execute(`
      UPDATE registration 
      SET Registration_Date = DATE_SUB(Registration_Date, INTERVAL 543 YEAR)
      WHERE YEAR(Registration_Date) = 2569
    `);
    console.log(`Registration dates updated: ${regResult.affectedRows} rows`);

    // Update check-in dates (if year is 2569)
    console.log('Updating check-in dates...');
    const [checkResult] = await connection.execute(`
      UPDATE check_in 
      SET CheckIn_Time = DATE_SUB(CheckIn_Time, INTERVAL 543 YEAR)
      WHERE YEAR(CheckIn_Time) = 2569
    `);
    console.log(`Check-in dates updated: ${checkResult.affectedRows} rows`);

    console.log('\n✅ All dates updated successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateDates();
