async function clearUserData(conn, userId) {
  await conn.query('DELETE FROM attendance_records WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM attendance WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM grades WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM enrollments WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM students WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM courses WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM academic WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM institution WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM notifications WHERE user_id=?', [userId]);
  await conn.query('DELETE FROM school_events WHERE user_id=?', [userId]);

}
async function initializeUserDefaults(conn, userId) {
  await conn.query(
    `INSERT INTO academic (semester, year, passing_grade, attendance_required, user_id)
     VALUES (1, '2025-2026', 40, 75, ?)`,
    [userId]
  );

  await conn.query(
    `INSERT INTO institution (name, email, phone, address, user_id)
     VALUES ('Demo University', 'demo@uni.com', '9999999999', 'Demo Address', ?)`,
    [userId]
  );

  await conn.query(
    `INSERT INTO notifications (email, grade, attendance, user_id)
     VALUES (1, 1, 1, ?)`,
    [userId]
  );
}
async function seedDemoData(conn, userId) {

  // Insert Courses
  // const course1 = `SCE1_${userId}`;
  // const course2 = `MAT2_${userId}`;
  // const course_name1 = `Science${userId}`;
  // const course_name2 = `Mathematics${userId}`;

  await conn.query(
    `INSERT INTO courses (course_id, course_name, instructor, schedule, user_id)
     VALUES
     ('SCE101','Science','Dr. Smith','Mon 10AM',?),
     ('MAT201','Mathematics','Dr. John','Tue 2PM',?)`,
    [userId, userId]
  );

  // Insert Students
  const student1 = `UNI2021${userId}01`;
  const student2 = `UNI2021${userId}02`;

  await conn.query(
    `INSERT INTO students
     (student_id, first_name, last_name, student_email, phone, date_of_birth, address, student_status, user_id)
     VALUES
     (?, 'Rahul','Sharma','rahul@gmail.com','9876543210','2001-01-01','Delhi','Active',?),
     (?, 'Anita','Verma','anita@gmail.com','9988776655','2002-02-02','Mumbai','Active',?)`,
    [student1, userId, student2, userId]
  );

  // Enrollments
  await conn.query(
    `INSERT INTO enrollments (student_id, course_id, user_id)
     VALUES
     (?, 'SCE101', ?),
     (?, 'MAT201', ?),
     (?, 'SCE101', ?)`,
    [
      student1, userId,
      student1, userId,
      student2, userId
    ]
  );

  // Grades
  await conn.query(
    `INSERT INTO grades (student_id, course_id, grade_numeric, grade_letter, performance, user_id)
     VALUES
     (?, 'SCE101', 85, 'A', 'Excellent', ?),
     (?, 'MAT201', 78, 'B', 'Good', ?),
     (?, 'SCE101', 90, 'A', 'Outstanding', ?)`,
    [
      student1, userId,
      student1, userId,
      student2, userId
    ]
  );

  // Attendance summary rows
  await conn.query(
    `INSERT INTO attendance 
     (student_id, course_id, total_classes, present, absent, attendance_rate, attendance_status, user_id)
     VALUES
     (?, 'SCE101', 10, 9, 1, 90.00, 'Good', ?),
     (?, 'MAT201', 8, 6, 2, 75.00, 'Average', ?),
     (?, 'SCE101', 10, 10, 0, 100.00, 'Excellent', ?)`,
    [
      student1, userId,
      student1, userId,
      student2, userId
    ]
  );
  //Events
  await conn.query(
    `INSERT INTO school_events (id, title, description, date, type, user_id)
    VALUES
    ('EVT001','Math Exam','Final Math Exam','2026-02-20','exam',?),
    ('EVT002','Science Fair','Inter-school Competition','2026-02-15','competition',?),
    ('EVT003','Annual Day','School Celebration','2026-02-25','celebration',?),
    ('EVT004','Sports Day','Sports Competition','2026-02-15','competition',?)`,
    [userId, userId, userId, userId]
  );
}

module.exports = {
  clearUserData,
  initializeUserDefaults,
  seedDemoData
};
