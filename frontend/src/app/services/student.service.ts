import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = 'http://localhost:3000/api/students';

  private studentsSubject = new BehaviorSubject<Student[] | null>(null);
  students$ = this.studentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadStudents(): void {
    this.http.get<Student[]>(this.apiUrl).subscribe({
      next: (data) => this.studentsSubject.next(data),
      error: (err) => console.error(err)
    });
  }
}
