import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private API = 'http://localhost:3000/api';

  private studentsSubject = new BehaviorSubject<any[]>([]);
  students$ = this.studentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadStudents(): void {
    this.http.get<any[]>(`${this.API}/students`)
      .subscribe({
        next: (data) => this.studentsSubject.next(data),
        error: (err) => console.error(err)
      });
  }

  getStudentDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/students/${id}`);
  }
  updateStudent(id: string, data: any): Observable<any> {
  return this.http.put(`${this.API}/students/${id}`, data);
}

}
