import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { StudentService } from '../../services/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class Students implements OnInit {

  students$!: Observable<any[]>;

  // track expanded rows
  private expandedRows = new Set<string>();

  // cache student details
  studentDetailsMap: Record<string, any> = {};

  constructor(
    private studentService: StudentService, 
    private router: Router) {}

  ngOnInit(): void {
    this.students$ = this.studentService.students$;
    this.loadStudents();
  }

  //  required by template
  loadStudents(): void {
    this.studentService.loadStudents();
  }

  /* ==============================
     VIEW / EXPAND LOGIC
     ============================== */

  toggleView(studentId: string): void {
    if (this.expandedRows.has(studentId)) {
      this.expandedRows.delete(studentId);
      return;
    }

    this.expandedRows.add(studentId);

    if (!this.studentDetailsMap[studentId]) {
      this.studentService
        .getStudentDetails(studentId)
        .subscribe(details => {
          this.studentDetailsMap[studentId] = details;
        });
    }
  }

  isExpanded(studentId: string): boolean {
    return this.expandedRows.has(studentId);
  }
  editStudent(studentId: string) {
    console.log('Navigating to edit:', studentId);
    this.router.navigate(['/students/edit', studentId]);
  }
}