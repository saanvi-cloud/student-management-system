import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SchoolEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {

  private API = 'http://localhost:3000/api/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<SchoolEvent[]> {
    return this.http.get<SchoolEvent[]>(this.API);
  }
}
