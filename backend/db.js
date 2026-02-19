const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
console.log(process.env.DB_USER);

// Optional: test connection (SAFE way for pools)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Connection Failed:', err);
    return;
  }
  console.log('MySQL Connected');
  connection.release();
});

// Export promise-based pool
module.exports = pool.promise();
