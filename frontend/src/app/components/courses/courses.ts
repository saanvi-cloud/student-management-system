import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {

  courses: any[] = [];

  courses$!: Observable<Course[] | null>;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courses$ = this.courseService.courses$;
    this.courseService.loadCourses();
  }

  refreshCourses(): void {
    this.courseService.loadCourses();
  }

  expandedCourses = new Set<string>();
  courseStudents: Record<string, any[]> = {};

  toggleView(courseId: string): void {
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
      return;
    }

    this.expandedCourses.add(courseId);

    if (!this.courseStudents[courseId]) {
      this.courseService
        .getCourseStudents(courseId)
        .subscribe(data => {
          this.courseStudents[courseId] = data;
        });
    }
  }

  isExpanded(courseId: string): boolean {
    return this.expandedCourses.has(courseId);
  }

  deleteCourse(courseId: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.courseService.loadCourses(); // 🔥 refresh data
        },
        error: (err) => {
          console.error('Delete failed', err);
        }
      });
    }
  }
}
