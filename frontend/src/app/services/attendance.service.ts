import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Attendance } from "../models/attendance.model";

@Injectable ({ providedIn: 'root'})
export class AttendanceService {
  private apiUrl = 'http://localhost:3000/api/attendance';

  constructor (private http: HttpClient) {};

  getAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.apiUrl);
  }
}