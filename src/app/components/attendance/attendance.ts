import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance {
  attendance = [
  {
    id: 1,
    studentName: 'John Doe',
    course: 'Computer Science',
    rate: 92,
    totalClasses: 50,
    present: 46,
    absent: 4,
    status: 'Excellent',
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    course: 'Business Administration',
    rate: 68,
    totalClasses: 50,
    present: 34,
    absent: 16,
    status: 'Needs Attention',
  },
  {
    id: 3,
    studentName: 'Robert Johnson',
    course: 'Engineering',
    rate: 80,
    totalClasses: 40,
    present: 32,
    absent: 8,
    status: 'Good',
  },
  {
    id: 4,
    studentName: 'Emily Williams',
    course: 'Medicine',
    rate: 95,
    totalClasses: 60,
    present: 57,
    absent: 3,
    status: 'Excellent',
  },
  {
    id: 5,
    studentName: 'Michael Brown',
    course: 'Arts',
    rate: 70,
    totalClasses: 50,
    present: 35,
    absent: 15,
    status: 'Needs Attention',
  },
];

}
