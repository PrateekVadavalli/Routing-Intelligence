const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: true });

console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASS =", process.env.DB_PASS);
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_NAME =", process.env.DB_NAME);
console.log("DB_PORT =", process.env.DB_PORT);

const { Pool } = require('pg');

const pool = new Pool({
  user: String(process.env.DB_USER),
  host: String(process.env.DB_HOST),
  database: String(process.env.DB_NAME),
  password: String(process.env.DB_PASS),
  port: Number(process.env.DB_PORT),
});

module.exports = pool;
