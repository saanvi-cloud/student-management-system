import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { Dashboard } from './components/dashboard/dashboard';
import { Students } from './components/students/students';
import { AddStudentComponent } from './components/add-student/add-student';
import { Courses } from './components/courses/courses';
import { Grades } from './components/grades/grades';
import { AttendanceComponent } from './components/attendance/attendance';
import { SettingsComponent } from './components/system/system';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './auth/auth';
import { CommonModule } from '@angular/common';
import { SettingsService } from './services/system.service';

@Component({
  selector: 'app-root',
  imports: [Header, Navbar, RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('student-management-system');
  constructor(public auth: AuthService, private router: Router, private settingsService: SettingsService) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  resetDemo() {
    if (!confirm('This will delete all your data and reload demo data. Continue?')) return;

    this.settingsService.resetDemo().subscribe({
      next: () => {
        alert('Demo data reset successfully');
        window.location.reload();
      },
      error: () => alert('Reset failed')
    });
  }
}
