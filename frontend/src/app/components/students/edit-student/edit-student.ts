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
  allCourses: any[] = [];
  selectedCourses = new Set<string>();
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id')!;
    this.loadStudent();
    this.loadCourses();
  }

  loadCourses(): void {
    this.studentService.getAllCourses()
      .subscribe(courses => this.allCourses = courses);
  }

  loadStudent(): void {
    this.studentService.getStudentDetails(this.studentId)
      .subscribe(data => {
        this.student = {
          ...data,
          date_of_birth: data.date_of_birth
            ? data.date_of_birth.split('T')[0] // 🔥 critical
            : ''
        };

        data.courses.forEach((c: any) =>
          this.selectedCourses.add(c.course_id)
        );

        this.loading = false;
      });
  }

  toggleCourse(courseId: string, event: any): void {
    event.target.checked
      ? this.selectedCourses.add(courseId)
      : this.selectedCourses.delete(courseId);
  }

  updateStudent(): void {
    if (!confirm('Are you sure you want to update this student?')) return;

    const payload = {
      first_name: this.student.first_name,
      last_name: this.student.last_name,
      email: this.student.student_email,      // ✅ mapping fixed
      phone: this.student.phone,
      date_of_birth: this.student.date_of_birth,
      address: this.student.address,
      status: this.student.student_status,    // ✅ mapping fixed
      course_ids: Array.from(this.selectedCourses)
    };

    console.log('Payload:', payload);
    console.log('Student ID:', this.studentId);

    this.studentService
      .updateStudent(this.studentId, payload)
      .subscribe({
        next: () => {
          alert('Student updated successfully');
          this.router.navigate(['/students']);
        },
        error: err => {
          console.error(err);
          alert('Update failed');
        }
      });
  }


  goBack(): void {
    this.router.navigate(['/students']);
  }
}
