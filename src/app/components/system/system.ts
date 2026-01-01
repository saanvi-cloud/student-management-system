import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system',
  imports: [CommonModule],
  templateUrl: './system.html',
  styleUrl: './system.css',
})
export class System {
  settings = {
    institution: 'Jyothy Institute of Technology',
    email: 'jit@gmail.com', 
    phone: '+91 1234567890', 
    address: 'Kanakapura road, tatguni', 
    currentSemester: '2', 
    currentYear: '2021-2022', 
    passingGrade: 41, 
    minAttendance: '75', 
    notifications: {
      email: true,
      grade: true
    }
  };
}
