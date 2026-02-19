import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  private apiUrl = 'https://student-management-system-apvn.onrender.com/api/attendance';

  constructor(private http: HttpClient) {}

  getAttendance() {
    let url = this.apiUrl;
    return this.http.get<Attendance[]>(url);
  }
  markAttendance(data: any) {
    return this.http.post('https://student-management-system-apvn.onrender.com/api/attendance/mark', data);
  }
  getMarkingList(): Observable<any[]> {
    return this.http.get<any[]>('https://student-management-system-apvn.onrender.com/api/attendance/marking-list');
  }
  getCourses() {
    return this.http.get<any[]>('https://student-management-system-apvn.onrender.com/api/courses');
  }

  getStudentsForCourse(courseId: string) {
    return this.http.get<any[]>(
      `https://student-management-system-apvn.onrender.com/api/attendance/students?course_id=${courseId}`
    );
  }
}
