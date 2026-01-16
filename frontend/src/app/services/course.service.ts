import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Course } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {

  private apiUrl = 'http://localhost:3000/api/courses';

  private coursesSubject = new BehaviorSubject<Course[] | null>(null);
  courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCourses(): void {
    this.http.get<Course[]>(this.apiUrl).subscribe({
      next: (data) => this.coursesSubject.next(data),
      error: (err) => console.error('Courses error:', err)
    });
  }
}
