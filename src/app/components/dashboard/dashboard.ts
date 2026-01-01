import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  tops = [
  { id: 1, name: 'John Doe', course: 'Computer Science', grade: 85.5, status: 'Graduated' }, 
  { id: 2, name: 'Jane Smith', course: 'Business Administration', grade: 92.0, status: 'Active' }, 
  { id: 3, name: 'Robert Johnson', course: 'Engineering', grade: 78.5, status: 'Inactive' }, 
  { id: 4, name: 'Emily Williams', course: 'Medicine', grade: 95.0, status: 'Active' }, 
  { id: 5, name: 'Michael Brown', course: 'Arts', grade: 72, status: 'Active' }
];
}
