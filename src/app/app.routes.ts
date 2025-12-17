import { Routes } from "@angular/router";
import { Dashboard } from './components/dashboard/dashboard';
import { Students } from './components/students/students';
import { AddStudent } from './components/add-student/add-student';
import { Courses } from './components/courses/courses';
import { Grades } from './components/grades/grades';
import { Attendance } from './components/attendance/attendance';
import { System } from './components/system/system';

export const routes: Routes = [
  {path: '', redirectTo:'dashboard', pathMatch:'full'}, 
  {path: 'dashboard', component: Dashboard}, 
  {path: 'students', component: Students}, 
  {path: 'add-student', component: AddStudent}, 
  {path: 'courses', component: Courses}, 
  {path: 'grades', component: Grades}, 
  {path: 'attendance', component: Attendance}, 
  {path: 'system', component: System}, 
  {path: '**', redirectTo: 'dashboard'}
];