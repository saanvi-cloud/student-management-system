import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';
import { Attendance } from '../../models/attendance.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit {

  attendance$!: Observable<Attendance[] | null>;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.attendance$ = this.attendanceService.attendance$;
    this.attendanceService.loadAttendance();
  }

  refreshAttendance(): void {
    this.attendanceService.loadAttendance();
  }
}
