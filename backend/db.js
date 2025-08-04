const { Pool } = require('pg');
require('dotenv').config();

// This is the only change you need.
// The 'pg' library automatically knows how to use the DATABASE_URL
// from the environment variables if you provide it as a connection string.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};