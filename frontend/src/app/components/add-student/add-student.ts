import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddStudentService } from '../../services/add-student.service';
import { AddStudent } from '../../models/add-student.model';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-student.html',
  styleUrl: './add-student.css',
})
export class AddStudentComponent {

  student: AddStudent = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    course_id: '',
    grade_numeric: undefined,
    date_of_birth: '',
    address: '',
    status: 'Active'
  };

  constructor(private addStudentService: AddStudentService) {}

  onSubmit() {
    console.log('Student data:', this.student);

    this.addStudentService.addStudent(this.student).subscribe({
      next: () => alert('Student added successfully'),
      error: err => {
        console.error(err);
        alert('Failed to add student');
      }
    });
  }
}
