const mysql = require('./backend/node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSQL() {
  const connection = await mysql.createConnection({
    host: 'tramway.proxy.rlwy.net',
    port: 18061,
    user: 'root',
    password: 'gteKJElKZmxDMKPtLgvZtgOUsvTkIKrP',
    database: 'railway',
    multipleStatements: true,
  });

  console.log('✅ Connected to Railway MySQL');

  // Import schema.sql
  console.log('📦 Importing schema.sql...');
  const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
  await connection.query(schema);
  console.log('✅ schema.sql imported');

  // Import insert_data.sql
  console.log('📦 Importing insert_data.sql...');
  const data = fs.readFileSync(path.join(__dirname, 'database', 'insert_data.sql'), 'utf8');
  await connection.query(data);
  console.log('✅ insert_data.sql imported');

  await connection.end();
  console.log('🎉 Done! Database is ready.');
}

importSQL().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
