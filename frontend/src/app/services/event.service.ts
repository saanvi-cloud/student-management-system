import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SchoolEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {

  private API = 'https://student-management-system-apvn.onrender.com/api/events';

  constructor(private http: HttpClient) {}

  // getEvents(): Observable<SchoolEvent[]> {
  //   return this.http.get<SchoolEvent[]>(this.API);
  // }
  getEvents() {
    return this.http.get<SchoolEvent[]>(`${this.API}`);
  }
}
