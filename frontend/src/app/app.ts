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
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Header, Navbar, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('student-management-system');
}
