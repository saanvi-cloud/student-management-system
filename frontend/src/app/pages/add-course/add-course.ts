import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-course.html',
  styleUrl: './add-course.css',
})
export class AddCourseComponent {

  course = {
    course_id: '',
    course_name: '',
    instructor: '',
    schedule: ''
  };

  constructor(
    private courseService: CourseService,
    private router: Router
  ) {}

  addCourse() {
    this.courseService.createCourse(this.course).subscribe({
      next: () => {
        this.router.navigate(['/courses']);
      },
      error: (err) => {
        console.error('Add failed', err);
      }
    });
  }
}