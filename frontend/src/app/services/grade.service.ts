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
}
