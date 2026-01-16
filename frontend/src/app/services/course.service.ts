import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Course } from "../models/course.model";

@Injectable ({ providedIn: 'root' })
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor (private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }
}