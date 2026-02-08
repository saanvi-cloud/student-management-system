import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';
import { Attendance } from '../../models/attendance.model';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit {

  // attendance: Attendance[] = [];
  attendance$!: Observable<Attendance[]>;
  selectedCourse: string = '';
  attendance: (Attendance & { status?: string })[] = [];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.attendance$ = this.attendanceService.getAttendance();
    this.loadAttendance();
  }

  refreshAttendance(): void {
    this.attendance$ = this.attendanceService.getAttendance();
  }

  loadAttendance(): void {
    this.attendance$ = this.attendanceService.getAttendance(this.selectedCourse);

    this.attendance$.subscribe(data => {
      this.attendance = data.map(student => ({
        ...student,
        status: 'Present' // default value
      }));
    });
  }

  onCourseChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCourse = selectElement.value;
    this.loadAttendance();
  }
  openMarkAttendance() {

    if (!this.selectedCourse) {
      alert('Please select a course first');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const records = this.attendance.map(student => ({
      student_id: student.student_id,
      status: student.status || 'Present'
    }));

    const payload = {
      course_id: this.selectedCourse,
      date: today,
      records: records
    };

    this.attendanceService.markAttendance(payload).subscribe({
      next: () => {
        alert('Attendance marked successfully!');
        this.loadAttendance();
      },
      error: err => console.error('Mark attendance error:', err)
    });
  }
}

