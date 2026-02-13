const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const {
  clearUserData,
  initializeUserDefaults,
  seedDemoData
} = require('./services/seedService');


//Login
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      'secretKey',
      { expiresIn: '1h' }
    );

    // Insert login log FIRST
    const now = new Date();

    const [result] = await db.execute(
      "INSERT INTO login_logs (user_email, login_time, user_id) VALUES (?, ?, ?)",
      [email, now, user.id]
    );

    const logId = result.insertId;

    
    res.json({ token, logId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { logId } = req.body;
    console.log("Logout body:", req.body);

    if (!logId) {
      return res.status(400).json({ message: "logId missing" });
    }

    const now = new Date();

    const [rows] = await db.execute(
      "SELECT login_time FROM login_logs WHERE id = ?",
      [logId]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid logId" });
    }

    const loginTime = new Date(rows[0].login_time);
    const duration = Math.floor((now - loginTime) / 1000);

    await db.execute(
      "UPDATE login_logs SET logout_time = ?, session_duration = ? WHERE id = ?",
      [now, duration, logId]
    );

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//Dashboard
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Top performing students
    const [topStudents] = await db.query(`
    SELECT 
      s.student_id,
      CONCAT(s.first_name, ' ', s.last_name) AS name,
      GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS course,
      COALESCE(ROUND(AVG(g.grade_numeric), 2), 0) AS grade,
      s.student_status AS status
    FROM students s
    LEFT JOIN grades g ON s.student_id = g.student_id
    LEFT JOIN courses c ON g.course_id = c.course_id
    WHERE s.user_id = ?
    GROUP BY s.student_id
    ORDER BY grade DESC
    LIMIT 5;
    `, [userId]);

    // Dashboard stats
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM students WHERE user_id = ?) AS totalStudents,
        (SELECT COUNT(*) FROM students WHERE student_status = 'Active' AND user_id = ?) AS activeStudents,
        (SELECT COUNT(*) FROM courses WHERE user_id = ?) AS totalCourses,
        (SELECT COUNT(*) FROM grades WHERE user_id = ?) AS totalGrades,
        (SELECT ROUND(AVG(grade_numeric),2) FROM grades WHERE user_id = ?) AS averageGrade
    `, [userId, userId, userId, userId, userId]);

    res.json({
      stats,
      topStudents
    });

  } catch (err) {
    console.error('DASHBOARD ERROR:', err);
    res.status(500).json({ error: 'Dashboard data failed' });
  }
});

//Students
// app.get('/api/students', authenticateToken, async (req, res) => {
//   const userId = req.user.id;
//   const sql = `
//     SELECT 
//       s.student_id,
//       CONCAT(s.first_name, ' ', s.last_name) AS student_name,
//       s.student_email,
//       s.student_status,
//       GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS courses,
//       COALESCE(ROUND(AVG(g.grade_numeric), 2), 0) AS grade_numeric
//     FROM students s
//     LEFT JOIN enrollments e ON s.student_id = e.student_id
//     LEFT JOIN courses c ON e.course_id = c.course_id
//     LEFT JOIN grades g ON s.student_id = g.student_id
//     WHERE s.user_id = ?
//     GROUP BY s.student_id;
//   `;

//   try {
//     const [rows] = await db.query(sql, [userId]);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: 'Database query failed' });
//   }
// });
app.get('/api/students', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT 
          s.student_id,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          s.student_email,
          s.student_status,
          GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS courses,
          COALESCE(ROUND(AVG(g.grade_numeric), 2), 0) AS grade_numeric
      FROM students s
      LEFT JOIN enrollments e 
          ON s.student_id = e.student_id
          AND s.user_id = e.user_id
      LEFT JOIN courses c 
          ON e.course_id = c.course_id
          AND e.user_id = c.user_id
      LEFT JOIN grades g 
          ON e.student_id = g.student_id
          AND e.course_id = g.course_id
          AND e.user_id = g.user_id
      WHERE s.user_id = ?
      GROUP BY s.student_id;`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("STUDENTS ERROR:", err);
    res.status(500).json(err);
  }
});
app.get('/api/students/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const [studentRows] = await db.query(
      `SELECT student_id, student_email, student_status, first_name, last_name, phone, date_of_birth, address
       FROM students WHERE student_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!studentRows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    const [courses] = await db.query(
      `SELECT c.course_id, c.course_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       WHERE e.student_id = ? AND e.user_id = ?`,
      [id, userId]
    );

    res.json({
      ...studentRows[0],
      courses
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/students', authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  const userId = req.user.id;
  try {
    await conn.beginTransaction();

    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      status,
      course_ids,
    } = req.body;

    const studentId = await generateStudentId(conn);

    await conn.query(
      `INSERT INTO students 
      (student_id, first_name, last_name, student_email, phone, date_of_birth, address, student_status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        status,
        userId
      ]
    );

    for (const courseId of course_ids) {
      await conn.query(
        `INSERT INTO enrollments (student_id, course_id, user_id)
         VALUES (?, ?, ?)`,
        [studentId, courseId, userId]
      );
    }

    for (const courseId of course_ids) {
      await conn.query(
        `INSERT INTO grades (student_id, course_id, user_id)
         VALUES (?, ?, ?)`,
        [studentId, courseId, userId]
      );

      await conn.query(
        `INSERT INTO attendance (student_id, course_id, total_classes, present, absent, user_id)
         VALUES (?, ?, 0, 0, 0, ?)`,
        [studentId, courseId, userId]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Student created successfully' });

  } catch (err) {
    await conn.rollback();
    console.error('ADD STUDENT ERROR:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
    console.log("ADD BODY:", req.body);

  }
});
app.put('/api/students/:id', authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  const studentId = req.params.id;
  const userId = req.user.id;

  try {
    await conn.beginTransaction();

    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      status,
      course_ids
    } = req.body;

    // Update student details
    const [result] = await conn.query(
      `UPDATE students
       SET first_name=?, last_name=?, student_email=?, phone=?, 
           date_of_birth=?, address=?, student_status=?
       WHERE student_id=? AND user_id = ?`,
      [
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        status,
        studentId,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Student not found or unauthorized");
    }

    if (Array.isArray(course_ids)) {
      await conn.query(
        'DELETE FROM enrollments WHERE student_id=? AND user_id=?',
        [studentId, userId]
      );

      for (const courseId of course_ids) {
        await conn.query(
          'INSERT INTO enrollments (student_id, course_id, user_id) VALUES (?, ?, ?)',
          [studentId, courseId, userId]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'Student updated successfully' });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
  console.log("PARAM:", req.params.id);
  console.log("BODY:", req.body);
});
app.get('/api/courses/list', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT course_id, course_name FROM courses WHERE user_id=?'
    , [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});
app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  const conn = await db.getConnection();
  const studentId = req.params.id;
  const userId = req.user.id;

  try {
    await conn.beginTransaction();

    // Delete dependent records first
    await conn.query(
      'DELETE FROM attendance WHERE student_id = ? AND user_id=?',
      [studentId, userId]
    );

    await conn.query(
      'DELETE FROM grades WHERE student_id = ? AND user_id=?',
      [studentId, userId]
    );

    await conn.query(
      'DELETE FROM enrollments WHERE student_id = ? AND user_id=?',
      [studentId, userId]
    );

    // Delete student
    const [result] = await conn.query(
      'DELETE FROM students WHERE student_id = ? AND user_id=?',
      [studentId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Student not found');
    }

    await conn.commit();
    res.json({ message: 'Student deleted successfully' });

  } catch (err) {
    await conn.rollback();
    console.error('DELETE STUDENT ERROR:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  } finally {
    conn.release();
  }
});

//Courses
app.get('/api/courses', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const sql = `
  SELECT 
    c.course_id,
    c.course_name,
    c.instructor,
    c.schedule,
    COUNT(e.student_id) AS students_enrolled
  FROM courses c
  LEFT JOIN enrollments e 
    ON c.course_id = e.course_id
    WHERE c.user_id=?
  GROUP BY 
    c.course_id,
    c.course_name,
    c.instructor,
    c.schedule;

  `; 
  try {
    const [courses] = await db.query (sql, [userId]);
    res.json(courses);
  }
  catch (err) {
    console.log('COURSES ERROR: ', err);
    res.status(500).json(err);
  }
});
app.get('/api/courses/:id/students', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  const sql = `
    SELECT
      s.student_id,
      CONCAT(s.first_name, ' ', s.last_name) AS student_name,
      g.grade_numeric,
      ROUND(
        (a.present / NULLIF(a.total_classes, 0)) * 100, 2
      ) AS attendance_rate
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    LEFT JOIN grades g 
      ON g.student_id = s.student_id AND g.course_id = e.course_id
    LEFT JOIN attendance a
      ON a.student_id = s.student_id AND a.course_id = e.course_id
    WHERE e.course_id = ? AND e.user_id=?;
  `;

  try {
    const [rows] = await db.query(sql, [courseId, userId]);
    res.json(rows);
  } catch (err) {
    console.error('COURSE STUDENTS ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch course students' });
  }
});
app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { course_name, instructor, schedule } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `UPDATE courses 
       SET course_name = ?, instructor = ?, schedule = ?
       WHERE course_id = ? AND user_id=?`,
      [course_name, instructor, schedule, id, userId]
    );

    res.json({ message: 'Course updated successfully' });
  } catch (err) {
    console.error('UPDATE COURSE ERROR:', err);
    res.status(500).json(err);
  }
});
app.get('/api/courses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT course_id, course_name, instructor, schedule FROM courses WHERE course_id = ? AND user_id=?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET COURSE ERROR:', err);
    res.status(500).json(err);
  }
});
app.delete('/api/courses/:course_id', authenticateToken, async (req, res) => {
  const { course_id } = req.params;
  const userId = req.user.id;

  try {
    // Delete dependent records first
    await db.query('DELETE FROM attendance WHERE course_id = ? AND user_id=?', [course_id, userId]);
    await db.query('DELETE FROM grades WHERE course_id = ? AND user_id=?', [course_id, userId]);
    await db.query('DELETE FROM enrollments WHERE course_id = ? AND user_id=?', [course_id, userId]);

    // Now delete course
    const [result] = await db.query(
      'DELETE FROM courses WHERE course_id = ? AND user_id=?',
      [course_id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });

  } catch (err) {
    console.error('DELETE COURSE ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});
app.post('/api/courses', authenticateToken, async (req, res) => {
  const { course_id, course_name, instructor, schedule } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      'INSERT INTO courses (course_id, course_name, instructor, schedule, user_id) VALUES (?, ?, ?, ?, ?)',
      [course_id, course_name, instructor, schedule, userId]
    );

    res.json({ message: 'Course added successfully' });

  } catch (err) {
    console.error('ADD COURSE ERROR:', err);
    res.status(500).json(err);
  }
});

//Grades
// app.get('/api/grades', authenticateToken, async (req, res) => {
//   const userId = req.user.id;
//   const sql = `
//   SELECT 
//     g.student_id,
//     CONCAT(s.first_name, ' ', s.last_name) AS student_name,
//     c.course_name,
//     c.instructor,
//     g.course_id,
//     g.grade_numeric,
//     g.grade_letter,
//     g.performance
//   FROM grades g
//   LEFT JOIN students s ON g.student_id = s.student_id
//   LEFT JOIN courses c ON g.course_id = c.course_id
//   WHERE g.user_id=?;
//   `;
//   try {
//     const [grades] = await db.query(sql, [userId]);
//     res.json(grades);
//   }
//   catch(err) {
//     console.log('GRADES ERROR: ',err);
//     res.status(500).json(err);
//   }
// });
app.get('/api/grades', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT 
          g.student_id,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          c.course_name,
          g.grade_numeric,
          g.grade_letter,
          g.performance,
          c.instructor,
          g.course_id
       FROM grades g
       JOIN students s 
            ON g.student_id = s.student_id 
            AND g.user_id = s.user_id
       JOIN courses c 
            ON g.course_id = c.course_id 
            AND g.user_id = c.user_id
       WHERE g.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GRADES ERROR:", err);
    res.status(500).json(err);
  }
});
app.put('/api/grades/:student_id/:course_id', authenticateToken, async (req, res) => {
  const { student_id, course_id } = req.params;
  const { grade_numeric, grade_letter, performance } = req.body;
  const userId = req.user.id;

  const sql = `
    UPDATE grades
    SET grade_numeric = ?, grade_letter = ?, performance = ?
    WHERE student_id = ? AND course_id = ? AND user_id=?
  `;

  try {
    await db.query(sql, [
      grade_numeric,
      grade_letter,
      performance,
      student_id,
      course_id, 
      userId
    ]);

    res.json({ message: 'Grade updated successfully' });
  } catch (err) {
    console.log('UPDATE ERROR:', err);
    res.status(500).json(err);
  }
});
app.delete('/api/grades/:student_id/:course_id', authenticateToken, async (req, res) => {
  const { student_id, course_id } = req.params;
  const userId = req.user.id;

  const sql = `
    UPDATE grades
    SET grade_numeric = NULL,
        grade_letter = NULL,
        performance = NULL
    WHERE student_id = ? AND course_id = ? AND user_id=?
  `;

  try {
    await db.query(sql, [student_id, course_id, userId]);
    res.json({ message: 'Grade cleared successfully' });
  } catch (err) {
    console.log('DELETE ERROR:', err);
    res.status(500).json(err);
  }
});

//Attendance
// app.get('/api/attendance', authenticateToken, async (req, res) => {
//   const { course } = req.query;
//   const userId = req.user.id;

//   let sql = `
//     SELECT 
//       a.student_id, 
//       CONCAT(s.first_name, ' ', s.last_name) AS student_name,
//       c.course_name, 
//       a.attendance_rate, 
//       a.total_classes, 
//       a.present, 
//       a.absent, 
//       a.attendance_status
//     FROM attendance a
//     LEFT JOIN students s 
//       ON s.student_id = a.student_id
//     LEFT JOIN courses c 
//       ON c.course_id = a.course_id
//     WHERE a.user_id = ?
//   `;

//   let values = [userId];

//   if (course && course !== 'Select a course') {
//     sql += ` AND c.course_name = ?`;
//     values.push(course);
//   }

//   try {
//     const [attendance] = await db.query(sql, values);
//     res.json(attendance);
//   } catch (err) {
//     console.log('ATTENDANCE ERROR: ', err);
//     res.status(500).json(err);
//   }
// });
app.get('/api/attendance', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT 
          a.student_id,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          c.course_name,
          a.attendance_rate,
          a.total_classes,
          a.present,
          a.absent,
          a.attendance_status
       FROM attendance a
       JOIN students s 
            ON a.student_id = s.student_id
            AND a.user_id = s.user_id
       JOIN courses c 
            ON a.course_id = c.course_id
            AND a.user_id = c.user_id
       WHERE a.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("ATTENDANCE ERROR:", err);
    res.status(500).json(err);
  }
});
app.post('/api/attendance/mark', authenticateToken, async (req, res) => {
  const { course_id, date, records } = req.body;
  const userId = req.user.id;

  try {
    for (const record of records) {
      await db.query(
        `INSERT INTO attendance_records (student_id, course_id, date, status, user_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [record.student_id, course_id, date, record.status, userId]
      );

      // Recalculate attendance summary
      const [[stats]] = await db.query(
        `SELECT 
            COUNT(*) as total,
            SUM(status='Present') as presentCount,
            SUM(status='Absent') as absentCount
        FROM attendance_records
        WHERE student_id=? AND course_id=? AND user_id=?`,
        [record.student_id, course_id, userId]
      );

      const rate = stats.total > 0
        ? ((stats.presentCount / stats.total) * 100).toFixed(2)
        : 0;

      let statusText = 'Low';
      if (rate >= 85) statusText = 'Excellent';
      else if (rate >= 75) statusText = 'Good';
      else if (rate >= 50) statusText = 'Average';

      await db.query(
        `UPDATE attendance
        SET total_classes=?, present=?, absent=?, attendance_rate=?, attendance_status=?
        WHERE student_id=? AND course_id=? AND user_id=?`,
        [
          stats.total,
          stats.presentCount,
          stats.absentCount,
          rate,
          statusText,
          record.student_id,
          course_id,
          userId
        ]
      );
    }
    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    console.log("MARK ERROR:", err);
    res.status(500).json(err);
  }
});
app.get('/api/attendance/mark', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const sql = `
  SELECT 
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_id,
    c.course_name
  FROM enrollments e
  JOIN students s ON e.student_id = s.student_id
  JOIN courses c ON e.course_id = c.course_id
  WHERE e.user_id=?;
  `;
  const [rows] = await db.query(sql, [userId]);
  res.json(rows);
});
app.get('/api/attendance/marking-list', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT 
      s.student_id,
      CONCAT(s.first_name, ' ', s.last_name) AS student_name,
      c.course_id,
      c.course_name
    FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
    JOIN courses c ON c.course_id = e.course_id
    WHERE s.user_id=?
  `;

  const [rows] = await db.query(sql, [userId]);
  res.json(rows);
});
app.get('/api/courses', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query("SELECT course_id, course_name FROM courses WHERE user_id=?", [userId]);
  res.json(rows);
});
app.get('/api/attendance/students', authenticateToken, async (req, res) => {
  const { course_id } = req.query;
  const userId = req.user.id;

  const [rows] = await db.query(`
    SELECT s.student_id,
           CONCAT(s.first_name, ' ', s.last_name) AS student_name
    FROM enrollments e
    JOIN students s ON s.student_id = e.student_id
    WHERE e.course_id = ? AND e.user_id=?
  `, [course_id, userId]);

  res.json(rows);
});

//Events
app.get('/api/events', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM school_events WHERE user_id=?',
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('EVENTS ERROR:', err);
    res.status(500).json(err);
  }
});

//Settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    let [institution] = await db.query(
      'SELECT * FROM institution WHERE user_id=? LIMIT 1',
      [userId]
    );

    let [academic] = await db.query(
      'SELECT * FROM academic WHERE user_id=? LIMIT 1',
      [userId]
    );

    let [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id=? LIMIT 1',
      [userId]
    );

    // 🔥 If missing → initialize
    if (!institution.length || !academic.length || !notifications.length) {

      await initializeUserDefaults(db, userId);

      [institution] = await db.query(
        'SELECT * FROM institution WHERE user_id=? LIMIT 1',
        [userId]
      );

      [academic] = await db.query(
        'SELECT * FROM academic WHERE user_id=? LIMIT 1',
        [userId]
      );

      [notifications] = await db.query(
        'SELECT * FROM notifications WHERE user_id=? LIMIT 1',
        [userId]
      );
    }

    res.json({
      institution: institution[0],
      academic: academic[0],
      notifications: {
        email: Boolean(notifications[0].email),
        grade: Boolean(notifications[0].grade),
        attendance: Boolean(notifications[0].attendance),
      }
    });

  } catch (err) {
    console.error('SETTINGS ERROR:', err);
    res.status(500).json(err);
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const { institution, academic, notifications } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `UPDATE institution SET name=?, email=?, phone=?, address=?  WHERE user_id=?`,
      [institution.name, institution.email, institution.phone, institution.address, userId]
    );

    await db.query(
      `UPDATE academic SET semester=?, year=?, passing_grade=?, attendance_required=?  WHERE user_id=?`,
      [academic.semester, academic.year, academic.passing_grade, academic.attendance_required, userId]
    );

    await db.query(
      `UPDATE notifications SET email=?, grade=?, attendance=?  WHERE user_id=?`,
      [
        notifications.email ? 1 : 0,
        notifications.grade ? 1 : 0,
        notifications.attendance ? 1 : 0,
        userId 
      ]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

async function generateStudentId(conn, userId) {
  const academicYear = '2021';

  const [[row]] = await conn.query(
    `
    SELECT COUNT(*) AS count 
    FROM students 
    WHERE student_id LIKE ? AND user_id=?
    `,
    [`UNI${academicYear}%`, userId]
  );

  const nextNumber = String(row.count + 1).padStart(3, '0');
  return `UNI${academicYear}${nextNumber}`;
}

// Seed function
app.post('/api/reset-demo', authenticateToken, async (req, res) => {

  const conn = await db.getConnection();
  const userId = req.user.id;

  try {
    await conn.beginTransaction();

    await clearUserData(conn, userId);
    await initializeUserDefaults(conn, userId);
    await seedDemoData(conn, userId);

    await conn.commit();
    res.json({ message: 'Demo data reset successfully' });

  } catch (err) {
    await conn.rollback();
    console.error("RESET ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
