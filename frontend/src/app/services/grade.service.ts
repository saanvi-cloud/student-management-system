import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Grade } from "../models/grade.model";

@Injectable ({ providedIn: 'root' })

export class GradeService {

  private apiUrl = 'http://localhost:3000/api/grades';

  constructor (private http: HttpClient) {}
  
  getGrades(): Observable<Grade[]> {
    return this.http.get<Grade[]>(this.apiUrl);
  }
}