import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-students',
  imports: [CommonModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  students = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', course: 'Computer Science', grade: 85.5, status: 'Graduated' }, 
  { id: 2, name: 'Jane Smith',email: 'jane.smith@example.com', course: 'Business Administration', grade: 92.0, status: 'Active' }, 
  { id: 3, name: 'Robert Johnson',email: 'robert.j@example.com', course: 'Engineering', grade: 78.5, status: 'Inactive' }, 
  { id: 4, name: 'Emily Williams',email: 'emily.w@example.com', course: 'Medicine', grade: 95.0, status: 'Active' }, 
  { id: 5, name: 'Michael Brown',email: 'michael.b@example.com', course: 'Arts', grade: 88.5, status: 'Active' }
];
}
