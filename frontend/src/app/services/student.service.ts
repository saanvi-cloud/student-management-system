import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private API = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/students`);
  }

  getStudentDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/students/${id}`);
  }

  updateStudent(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.API}/students/${id}`, payload);
  }

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/courses/list`);
  }
  deleteStudent(id: string) {
    return this.http.delete(`${this.API}/students/${id}`);
  }
}
