import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-course.html'
})
export class EditCourseComponent implements OnInit {

  course = {
    course_id: '',
    course_name: '',
    instructor: '',
    schedule: ''
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  loadCourse(id: string): void {
    this.http.get<any>(`http://localhost:3000/api/courses/${id}`)
      .subscribe({
        next: data => this.course = data,
        error: err => console.error(err)
      });
  }

  updateCourse(): void {
    this.http.put(
      `http://localhost:3000/api/courses/${this.course.course_id}`,
      {
        course_name: this.course.course_name,
        instructor: this.course.instructor,
        schedule: this.course.schedule
      }
    ).subscribe({
      next: () => this.router.navigate(['/courses']),
      error: err => console.error(err)
    });
  }
  goBack(): void {
    this.router.navigate(['/courses']);
  }
}
