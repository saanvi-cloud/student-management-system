import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { Dashboard } from './components/dashboard/dashboard';
import { Students } from './components/students/students';
import { AddStudent } from './components/add-student/add-student';

@Component({
  selector: 'app-root',
  imports: [Header, Navbar, Dashboard, Students, AddStudent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('student-management-system');
}
