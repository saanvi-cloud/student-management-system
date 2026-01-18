import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddStudent } from '../models/add-student.model';

@Injectable({ providedIn: 'root' })
export class AddStudentService {

  private apiUrl = 'http://localhost:3000/api/students';

  constructor(private http: HttpClient) {}

  addStudent(student: AddStudent): Observable<any> {
    return this.http.post(this.apiUrl, student);
  }
}
