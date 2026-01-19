const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/dashboard', async (req, res) => {
  try {
    // Top performing students
    const [topStudents] = await db.query(`
      SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS course,
        ROUND(AVG(g.grade_numeric), 2) AS grade,
        s.student_status AS status
      FROM students s
      LEFT JOIN grades g ON s.student_id = g.student_id
      LEFT JOIN courses c ON g.course_id = c.course_id
      GROUP BY s.student_id
      ORDER BY grade DESC
      LIMIT 5
    `);

    // Dashboard stats
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM students) AS totalStudents,
        (SELECT COUNT(*) FROM courses) AS totalCourses,
        (SELECT COUNT(*) FROM grades) AS totalGrades
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

app.get('/api/students', async (req, res) => {
  const sql = `
  SELECT 
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.student_email,
    s.student_status,
    GROUP_CONCAT(DISTINCT c.course_name SEPARATOR ', ') AS courses,
    AVG(g.grade_numeric) AS grade_numeric
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
    console.error('SQL ERROR:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});
app.post('/api/students', async (req, res) => {
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

  try {
    // START TRANSACTION
    await db.query('START TRANSACTION');

    // 1️⃣ Generate new student_id
    const [rows] = await db.query(
      `SELECT student_id FROM students ORDER BY student_id DESC LIMIT 1`
    );

    let newId;
    if (rows.length === 0) {
      newId = 'UNI2021001';
    } else {
      const lastId = rows[0].student_id;
      const prefix = lastId.substring(0, 7);
      const number = parseInt(lastId.substring(7)) + 1;
      newId = prefix + number.toString().padStart(3, '0');
    }

    // 2️⃣ Insert student
    await db.query(
      `INSERT INTO students
      (student_id, first_name, last_name, student_email, phone, date_of_birth, address, student_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth || null,
        address,
        status
      ]
    );

    // 3️⃣ Insert enrollments + empty grades + empty attendance
    for (const course_id of course_ids) {

      await db.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES (?, ?)`,
        [newId, course_id]
      );

      await db.query(
        `INSERT INTO grades
        (student_id, course_id, grade_numeric, grade_letter, performance, actions)
        VALUES (?, ?, NULL, NULL, NULL, NULL)`,
        [newId, course_id]
      );

      await db.query(
        `INSERT INTO attendance
        (student_id, course_id, attendance_rate, total_classes, present, absent, attendance_status)
        VALUES (?, ?, NULL, 0, 0, 0, NULL)`,
        [newId, course_id]
      );
    }

    // COMMIT
    await db.query('COMMIT');

    res.status(201).json({
      message: 'Student added successfully',
      student_id: newId
    });

  } catch (err) {
    // ROLLBACK ON ERROR
    await db.query('ROLLBACK');
    console.error('ADD STUDENT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

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

app.get('/api/grades', async (req, res) => {
  const sql = `
  SELECT 
    g.student_id, 
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_name, 
    g.grade_numeric, 
    g.grade_letter, 
    g.performance, 
    g.actions
  FROM grades g
  LEFT JOIN students s 
    ON g.student_id = s.student_id 
  LEFT JOIN courses c 
    ON g.course_id = c.course_id;

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

app.get('/api/attendance', async (req, res) => {
  const sql = `
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
    ON c.course_id = a.course_id;
    `;
  try {
    const [attendance] = await db.query(sql);
    res.json(attendance);
  }
  catch(err) {
    console.log('ATTENDANCE ERROR: ', err);
    res.status(500).json(err);
  }
});

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

app.listen(3000, () => console.log('Server running on port 3000'));
