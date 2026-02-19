import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Course } from '../models/course.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CourseService {

  private apiUrl = 'https://student-management-system-apvn.onrender.com/api/courses';

  private coursesSubject = new BehaviorSubject<Course[] | null>(null);
  courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCourses(): void {
    this.http.get<Course[]>(this.apiUrl).subscribe({
      next: (data) => this.coursesSubject.next(data),
      error: (err) => console.error('Courses error:', err)
    });
  }
  getCourseStudents(courseId: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/${courseId}/students`
    );
  }
  getCourseById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateCourse(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`);
  }

  createCourse(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}
