import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post(`${this.API}/login`, { email, password });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    const logId = localStorage.getItem('logId');

    if (logId) {
      this.http.post('http://localhost:3000/api/auth/logout', { logId })
        .subscribe();
    }

    localStorage.removeItem('token');
    localStorage.removeItem('logId');
    this.router.navigate(['/login']);
  }
}
