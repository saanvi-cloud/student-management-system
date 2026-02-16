import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance-mark',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-mark.html',
  styleUrl: './attendance-mark.css'
})
export class AttendanceMark implements OnInit {

  courses: any[] = [];
  students: any[] = [];

  selectedCourse: string = '';
  selectedDate: string = '';

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loadCourses();
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadCourses();
  }

  loadCourses() {
    // Create a new service method for this
    this.attendanceService.getCourses().subscribe(data => {
      this.courses = data;
      if (this.courses.length > 0) {
        this.selectedCourse = this.courses[0].course_id;
        this.loadStudents(); // auto-load students too
      }
    });
  }

  loadStudents() {
    if (!this.selectedCourse || !this.selectedDate) return;

    this.attendanceService
      .getStudentsForCourse(this.selectedCourse)
      .subscribe(data => {
        this.students = data.map(s => ({
          ...s,
          status: 'Present'  // default
        }));
      });
  }

  mark(student: any, status: string) {
    student.status = status;
  }

  saveAttendance() {
    const payload = {
      course_id: this.selectedCourse,
      date: this.selectedDate,
      records: this.students.map(s => ({
        student_id: s.student_id,
        status: s.status
      }))
    };

    this.attendanceService.markAttendance(payload).subscribe({
      next: () => {
        alert("Attendance saved successfully!");
      },
      error: err => console.error(err)
    });
  }
}
