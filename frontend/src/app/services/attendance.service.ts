import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Attendance } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  private apiUrl = 'http://localhost:3000/api/attendance';

  private attendanceSubject = new BehaviorSubject<Attendance[] | null>(null);
  attendance$ = this.attendanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAttendance(): void {
    this.http.get<Attendance[]>(this.apiUrl).subscribe({
      next: (data) => this.attendanceSubject.next(data),
      error: (err) => console.error('Attendance error:', err)
    });
  }
}
