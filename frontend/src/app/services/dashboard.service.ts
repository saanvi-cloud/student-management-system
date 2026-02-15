import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DashboardResponse } from '../models/dashboard.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private API = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.API);
  }
  getRecentActivity() {
    return this.http.get<any[]>('http://localhost:3000/api/activity');
  }
}
