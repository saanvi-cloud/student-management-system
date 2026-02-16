import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Grade } from '../models/grade.model';

@Injectable({ providedIn: 'root' })
export class GradeService {

  private apiUrl = 'http://localhost:3000/api/grades';

  private gradesSubject = new BehaviorSubject<Grade[] | null>(null);
  grades$ = this.gradesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadGrades(): void {
    this.http.get<Grade[]>(this.apiUrl).subscribe({
      next: (data) => this.gradesSubject.next(data),
      error: (err) => console.error('Grades error:', err)
    });
  }
  updateGrade(grade: Grade) {
    return this.http.put(
      `http://localhost:3000/api/grades/${grade.student_id}/${grade.course_id}`,
      {
        grade_numeric: grade.grade_numeric,
        grade_letter: grade.grade_letter,
        performance: grade.performance
      }
    );
  }
  deleteGrade(studentId: string, courseId: string) {
    return this.http.delete(
      `http://localhost:3000/api/grades/${studentId}/${courseId}`
    );
  }
  bulkUpdate(data: any) {
    return this.http.put(
      `${this.apiUrl}/bulk`,
      data
    );
  }
}
