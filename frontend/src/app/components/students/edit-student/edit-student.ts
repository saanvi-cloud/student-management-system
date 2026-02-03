import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-edit-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-student.html',
  styleUrls: ['./edit-student.css']
})
export class EditStudent implements OnInit {

  studentId!: string;
  student: any = {};
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id')!;
    this.loadStudent();
  }

  loadStudent(): void {
    this.studentService.getStudentDetails(this.studentId)
      .subscribe(data => {
        this.student = data;
        this.loading = false;
      });
  }
  confirmUpdate(): void {
    if (!confirm('Are you sure you want to update this student?')) {
      return;
    }

    this.studentService
      .updateStudent(this.studentId, this.student)
      .subscribe(() => {
        alert('Student updated successfully');
        this.router.navigate(['/students']);
      });
  }
  goBack(): void {
    this.router.navigate(['/students']);
  }
}
