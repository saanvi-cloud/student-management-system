import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {

  students$!: Observable<Student[] | null>;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.students$ = this.studentService.students$;
    this.studentService.loadStudents();
  }

  loadStudents(): void {
    this.studentService.loadStudents();
  }
}
