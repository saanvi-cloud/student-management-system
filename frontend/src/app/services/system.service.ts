import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; 
import { tap } from 'rxjs/operators'; 
import { Settings } from '../models/system.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private apiUrl = 'https://student-management-system-apvn.onrender.com/api/settings';

  private settingsSubject = new BehaviorSubject<Settings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadSettings(): void {
    this.http.get<Settings>(this.apiUrl).subscribe({
      next: (data) => this.settingsSubject.next(data),
      error: (err) => console.error(err)
    });
  }

  updateSettings(settings: Settings): Observable<any> {
    return this.http.put(this.apiUrl, settings).pipe(
      tap(() => this.settingsSubject.next(settings))
    );
  }

  resetDemo() {
    return this.http.post('https://student-management-system-apvn.onrender.com/api/reset-demo', {});
  }
}

