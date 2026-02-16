import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';
import { Attendance } from '../../models/attendance.model';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit {

  courses: string[] = [];
  selectedCourse: string = '';
  allAttendance: Attendance[] = [];
  filteredAttendance: Attendance[] = [];
  attendance$!: Observable<Attendance[]>;
  attendance: (Attendance & { status?: string })[] = [];
  excellentCount = 0;
  goodCount = 0;
  needsAttentionCount = 0;


  constructor(private attendanceService: AttendanceService, private router: Router) {}

  ngOnInit(): void {
    this.attendanceService.getAttendance().subscribe(data => {
      this.allAttendance = data;
      this.extractCourses(data);
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredAttendance = this.allAttendance.filter(a =>
      !this.selectedCourse || a.course_name === this.selectedCourse
    );
    this.calculateAttendanceDistribution();
  }

  extractCourses(data: Attendance[]) {
    const uniqueCourses = new Set(data.map(a => a.course_name));
    this.courses = Array.from(uniqueCourses);
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
  loadAttendance(): void {
    this.attendance$ = this.attendanceService.getAttendance();
  
    this.attendance$.subscribe(data => {
      this.attendance = data.map(student => ({
        ...student,
        status: 'Present' // default value
      }));
    });
  }
  navigateToAttendanceMarking(): void {
    this.router.navigate(['/attendance-mark']);
  }
  calculateAttendanceDistribution() {

    this.excellentCount = 0;
    this.goodCount = 0;
    this.needsAttentionCount = 0;

    this.filteredAttendance.forEach(student => {

      const rate = Number(student.attendance_rate);

      if (rate >= 90) {
        this.excellentCount++;
      } else if (rate >= 75) {
        this.goodCount++;
      } else {
        this.needsAttentionCount++;
      }

    });
  }
}


