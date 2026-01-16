// backend/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'students'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

module.exports = db.promise();
