const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

//Login
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.post('/api/auth/login', async (req, res) => {
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

  res.json({ token, logId });
  const now = new Date();

  const [result] = await db.execute(
    "INSERT INTO login_logs (user_email, login_time) VALUES (?, ?)",
    [email, now]
  );

  // Get inserted log id
  const logId = result.insertId;
});
app.post('/logout', async (req, res) => {
  const { logId } = req.body;

  const now = new Date();

  // Get login_time first
  const [rows] = await db.execute(
    "SELECT login_time FROM login_logs WHERE id = ?",
    [logId]
  );

  if (!rows.length) {
    return res.status(400).json({ message: "Invalid logId" });
  }

  const loginTime = new Date(rows[0].login_time);
  const duration = Math.floor((now - loginTime) / 1000); // seconds

  await db.execute(
    "UPDATE login_logs SET logout_time = ?, session_duration = ? WHERE id = ?",
    [now, duration, logId]
  );

  res.json({ message: "Logged out successfully" });
});

//Dashboard
app.get('/api/dashboard', async (req, res) => {
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
    GROUP BY s.student_id
    ORDER BY grade DESC
    LIMIT 5;
    `);

    // Dashboard stats
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM students) AS totalStudents,
        (SELECT COUNT(*) FROM students WHERE student_status = 'Active') AS activeStudents,
        (SELECT COUNT(*) FROM courses) AS totalCourses,
        (SELECT COUNT(*) FROM grades) AS totalGrades,
        (SELECT ROUND(AVG(grade_numeric),2) FROM grades) AS averageGrade
    `);

    res.json({
      stats,
      topStudents
    });

  } catch (err) {
    console.error('DASHBOARD ERROR:', err);
    res.status(500).json({ error: 'Dashboard data failed' });
  }
});
// app.get('/api/dashboard', async (req, res) => {
//   try {
//     // Top performing students
//     const [topStudents] = await db.query(`
//     SELECT 
//       s.student_id,
//       CONCAT(s.first_name, ' ', s.last_name) AS name,
//       GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS course,
//       COALESCE(ROUND(AVG(g.grade_numeric), 2), 0) AS grade,
//       s.student_status AS status
//     FROM students s
//     LEFT JOIN grades g ON s.student_id = g.student_id
//     LEFT JOIN courses c ON g.course_id = c.course_id
//     GROUP BY s.student_id
//     ORDER BY grade DESC
//     LIMIT 5;
//     `);

//     // Dashboard stats
//     const [[stats]] = await db.query(`
//       SELECT
//         (SELECT COUNT(*) FROM students) AS totalStudents,
//         (SELECT COUNT(*) FROM courses) AS totalCourses,
//         (SELECT COUNT(*) FROM grades) AS totalGrades
//     `);

//     res.json({
//       stats,
//       topStudents
//     });

//   } catch (err) {
//     console.error('DASHBOARD ERROR:', err);
//     res.status(500).json({ error: 'Dashboard data failed' });
//   }
// });


//Students
app.get('/api/students', async (req, res) => {
  const sql = `
    SELECT 
      s.student_id,
      CONCAT(s.first_name, ' ', s.last_name) AS student_name,
      s.student_email,
      s.student_status,
      GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS courses,
      COALESCE(ROUND(AVG(g.grade_numeric), 2), 0) AS grade_numeric
    FROM students s
    LEFT JOIN enrollments e ON s.student_id = e.student_id
    LEFT JOIN courses c ON e.course_id = c.course_id
    LEFT JOIN grades g ON s.student_id = g.student_id
    GROUP BY s.student_id;
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database query failed' });
  }
});
app.get('/api/students/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [studentRows] = await db.query(
      `SELECT student_id, student_email, student_status, first_name, last_name, phone, date_of_birth, address
       FROM students WHERE student_id = ?`,
      [id]
    );

    if (!studentRows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    const [courses] = await db.query(
      `SELECT c.course_id, c.course_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       WHERE e.student_id = ?`,
      [id]
    );

    res.json({
      ...studentRows[0],
      courses
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/students', async (req, res) => {
  const conn = await db.getConnection();
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

    const studentId = await generateStudentId(conn);

    await conn.query(
      `INSERT INTO students 
      (student_id, first_name, last_name, student_email, phone, date_of_birth, address, student_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        status
      ]
    );

    for (const courseId of course_ids) {
      await conn.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES (?, ?)`,
        [studentId, courseId]
      );
    }

    for (const courseId of course_ids) {
      await conn.query(
        `INSERT INTO grades (student_id, course_id)
         VALUES (?, ?)`,
        [studentId, courseId]
      );

      await conn.query(
        `INSERT INTO attendance (student_id, course_id, total_classes, present, absent)
         VALUES (?, ?, 0, 0, 0)`,
        [studentId, courseId]
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
  }
});
app.put('/api/students/:id', async (req, res) => {
  const conn = await db.getConnection();
  const studentId = req.params.id;

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

    // 1️⃣ Update student details
    await conn.query(
      `UPDATE students
       SET first_name=?, last_name=?, student_email=?, phone=?, 
           date_of_birth=?, address=?, student_status=?
       WHERE student_id=?`,
      [
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        status,
        studentId
      ]
    );

    if (Array.isArray(course_ids)) {
      await conn.query(
        'DELETE FROM enrollments WHERE student_id=?',
        [studentId]
      );

      for (const courseId of course_ids) {
        await conn.query(
          'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
          [studentId, courseId]
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
app.get('/api/courses/list', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT course_id, course_name FROM courses'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});
app.delete('/api/students/:id', async (req, res) => {
  const conn = await db.getConnection();
  const studentId = req.params.id;

  try {
    await conn.beginTransaction();

    // Delete dependent records first
    await conn.query(
      'DELETE FROM attendance WHERE student_id = ?',
      [studentId]
    );

    await conn.query(
      'DELETE FROM grades WHERE student_id = ?',
      [studentId]
    );

    await conn.query(
      'DELETE FROM enrollments WHERE student_id = ?',
      [studentId]
    );

    // Delete student
    const [result] = await conn.query(
      'DELETE FROM students WHERE student_id = ?',
      [studentId]
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
app.get('/api/courses', async (req, res) => {
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
  GROUP BY 
    c.course_id,
    c.course_name,
    c.instructor,
    c.schedule;

  `; 
  try {
    const [courses] = await db.query (sql);
    res.json(courses);
  }
  catch (err) {
    console.log('COURSES ERROR: ', err);
    res.status(500).json(err);
  }
});
app.get('/api/courses/:id/students', async (req, res) => {
  const courseId = req.params.id;

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
    WHERE e.course_id = ?;
  `;

  try {
    const [rows] = await db.query(sql, [courseId]);
    res.json(rows);
  } catch (err) {
    console.error('COURSE STUDENTS ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch course students' });
  }
});
app.put('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { course_name, instructor, schedule } = req.body;

  try {
    await db.query(
      `UPDATE courses 
       SET course_name = ?, instructor = ?, schedule = ?
       WHERE course_id = ?`,
      [course_name, instructor, schedule, id]
    );

    res.json({ message: 'Course updated successfully' });
  } catch (err) {
    console.error('UPDATE COURSE ERROR:', err);
    res.status(500).json(err);
  }
});
app.get('/api/courses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT course_id, course_name, instructor, schedule FROM courses WHERE course_id = ?',
      [id]
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
app.delete('/api/courses/:course_id', async (req, res) => {
  const { course_id } = req.params;

  try {
    // 1️⃣ Delete dependent records first
    await db.query('DELETE FROM attendance WHERE course_id = ?', [course_id]);
    await db.query('DELETE FROM grades WHERE course_id = ?', [course_id]);
    await db.query('DELETE FROM enrollments WHERE course_id = ?', [course_id]);

    // 2️⃣ Now delete course
    const [result] = await db.query(
      'DELETE FROM courses WHERE course_id = ?',
      [course_id]
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
app.post('/api/courses', async (req, res) => {
  const { course_id, course_name, instructor, schedule } = req.body;

  try {
    await db.query(
      'INSERT INTO courses (course_id, course_name, instructor, schedule) VALUES (?, ?, ?, ?)',
      [course_id, course_name, instructor, schedule]
    );

    res.json({ message: 'Course added successfully' });

  } catch (err) {
    console.error('ADD COURSE ERROR:', err);
    res.status(500).json(err);
  }
});

//Grades
app.get('/api/grades', async (req, res) => {
  const sql = `
  SELECT 
    g.student_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_name,
    c.instructor,
    g.course_id,
    g.grade_numeric,
    g.grade_letter,
    g.performance
  FROM grades g
  LEFT JOIN students s ON g.student_id = s.student_id
  LEFT JOIN courses c ON g.course_id = c.course_id;

  `;
  try {
    const [grades] = await db.query(sql);
    res.json(grades);
  }
  catch(err) {
    console.log('GRADES ERROR: ',err);
    res.status(500).json(err);
  }
});
app.put('/api/grades/:student_id/:course_id', async (req, res) => {
  const { student_id, course_id } = req.params;
  const { grade_numeric, grade_letter, performance } = req.body;

  const sql = `
    UPDATE grades
    SET grade_numeric = ?, grade_letter = ?, performance = ?
    WHERE student_id = ? AND course_id = ?
  `;

  try {
    await db.query(sql, [
      grade_numeric,
      grade_letter,
      performance,
      student_id,
      course_id
    ]);

    res.json({ message: 'Grade updated successfully' });
  } catch (err) {
    console.log('UPDATE ERROR:', err);
    res.status(500).json(err);
  }
});
app.delete('/api/grades/:student_id/:course_id', async (req, res) => {
  const { student_id, course_id } = req.params;

  const sql = `
    UPDATE grades
    SET grade_numeric = NULL,
        grade_letter = NULL,
        performance = NULL
    WHERE student_id = ? AND course_id = ?
  `;

  try {
    await db.query(sql, [student_id, course_id]);
    res.json({ message: 'Grade cleared successfully' });
  } catch (err) {
    console.log('DELETE ERROR:', err);
    res.status(500).json(err);
  }
});

//Attendance
app.get('/api/attendance', async (req, res) => {

  const { course } = req.query;

  let sql = `
    SELECT 
      a.student_id, 
      CONCAT(s.first_name, ' ', s.last_name) AS student_name,
      c.course_name, 
      a.attendance_rate, 
      a.total_classes, 
      a.present, 
      a.absent, 
      a.attendance_status
    FROM attendance a
    LEFT JOIN students s 
      ON s.student_id = a.student_id
    LEFT JOIN courses c 
      ON c.course_id = a.course_id
  `;

  let values = [];

  if (course && course !== 'Select a course') {
    sql += ` WHERE c.course_name = ?`;
    values.push(course);
  }

  try {
    const [attendance] = await db.query(sql, values);
    res.json(attendance);
  } catch (err) {
    console.log('ATTENDANCE ERROR: ', err);
    res.status(500).json(err);
  }
});
app.post('/api/attendance/mark', async (req, res) => {
  const { course_id, date, records } = req.body;

  try {
    for (const record of records) {
      await db.query(
        `INSERT INTO attendance_records (student_id, course_id, date, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [record.student_id, course_id, date, record.status]
      );
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    console.log("MARK ERROR:", err);
    res.status(500).json(err);
  }
});
app.get('/api/attendance/mark', async (req, res) => {
  const sql = `
  SELECT 
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_id,
    c.course_name
  FROM enrollments e
  JOIN students s ON e.student_id = s.student_id
  JOIN courses c ON e.course_id = c.course_id;`;
  const [rows] = await db.query(sql);
  res.json(rows);
});
app.get('/api/attendance/marking-list', async (req, res) => {
  const sql = `
    SELECT 
      s.student_id,
      CONCAT(s.first_name, ' ', s.last_name) AS student_name,
      c.course_id,
      c.course_name
    FROM students s
    JOIN enrollments e ON s.student_id = e.student_id
    JOIN courses c ON c.course_id = e.course_id
  `;

  const [rows] = await db.query(sql);
  res.json(rows);
});
app.get('/api/courses', async (req, res) => {
  const [rows] = await db.query("SELECT course_id, course_name FROM courses");
  res.json(rows);
});
app.get('/api/attendance/students', async (req, res) => {
  const { course_id } = req.query;

  const [rows] = await db.query(`
    SELECT s.student_id,
           CONCAT(s.first_name, ' ', s.last_name) AS student_name
    FROM enrollments e
    JOIN students s ON s.student_id = e.student_id
    WHERE e.course_id = ?
  `, [course_id]);

  res.json(rows);
});


//Settings
app.get('/api/settings', async (req, res) => {
  try {
    const [institution] = await db.query('SELECT * FROM institution LIMIT 1');
    const [academic] = await db.query('SELECT * FROM academic LIMIT 1');
    const [notifications] = await db.query('SELECT * FROM notifications LIMIT 1');

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

app.put('/api/settings', async (req, res) => {
  const { institution, academic, notifications } = req.body;

  try {
    await db.query(
      `UPDATE institution SET name=?, email=?, phone=?, address=?`,
      [institution.name, institution.email, institution.phone, institution.address]
    );

    await db.query(
      `UPDATE academic SET semester=?, year=?, passing_grade=?, attendance_required=?`,
      [academic.semester, academic.year, academic.passing_grade, academic.attendance_required]
    );

    await db.query(
      `UPDATE notifications SET email=?, grade=?, attendance=?`,
      [
        notifications.email ? 1 : 0,
        notifications.grade ? 1 : 0,
        notifications.attendance ? 1 : 0
      ]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

async function generateStudentId(conn) {
  const academicYear = '2021';

  const [[row]] = await conn.query(`
    SELECT COUNT(*) AS count 
    FROM students 
    WHERE student_id LIKE 'UNI${academicYear}%'
  `);

  const nextNumber = String(row.count + 1).padStart(3, '0');
  return `UNI${academicYear}${nextNumber}`;
}

app.listen(3000, () => console.log('Server running on port 3000'));
