const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully!');
    client.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.stack);
    process.exit(1);
  });
