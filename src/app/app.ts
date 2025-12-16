import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { Dashboard } from './components/dashboard/dashboard';
import { Students } from './components/students/students';
import { AddStudent } from './components/add-student/add-student';
import { Courses } from './components/courses/courses';
import { Grades } from './components/grades/grades';
import { Attendance } from './components/attendance/attendance';
import { System } from './components/system/system';

@Component({
  selector: 'app-root',
  imports: [Header, Navbar, Dashboard, Students, AddStudent, Courses, Grades, Attendance, System],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('student-management-system');
}
