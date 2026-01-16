import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; 
import { tap } from 'rxjs/operators'; 
import { Settings } from '../models/system.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {

  private apiUrl = 'http://localhost:3000/api/settings';
  private settingsCache!: Settings;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Settings> {
    if (this.settingsCache) {
      return of(this.settingsCache);
    }

    return this.http.get<Settings>(this.apiUrl).pipe(
      tap(data => this.settingsCache = data)
    );
  }

  updateSettings(settings: Settings): Observable<any> {
    return this.http.put(this.apiUrl, settings).pipe(
      tap(() => this.settingsCache = settings) // keep cache in sync
    );
  }
}
