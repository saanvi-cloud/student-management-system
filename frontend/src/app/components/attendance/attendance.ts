import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';
import { Attendance } from '../../models/attendance.model';

@Component({
  selector: 'app-attendance', 
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit{
  attendance: Attendance[] = [];

  constructor (private attendanceService: AttendanceService) {};

  ngOnInit(): void {
    this.attendanceService.getAttendance().subscribe(data => {
      console.log('Attendance: ', data);
      this.attendance = data;
    });
  }
}
