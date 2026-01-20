const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'students',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
