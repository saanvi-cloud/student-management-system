import { Routes } from "@angular/router";
import { Dashboard } from './components/dashboard/dashboard';
import { Students } from './components/students/students';
import { Courses } from './components/courses/courses';
import { AddStudentComponent } from './components/add-student/add-student';
import { Grades } from './components/grades/grades';
import { AttendanceComponent } from './components/attendance/attendance';
import { SettingsComponent } from './components/system/system';

export const routes: Routes = [
  {path: '', redirectTo:'dashboard', pathMatch:'full'}, 
  {path: 'dashboard', component: Dashboard}, 
  {path: 'students', component: Students}, 
  {path: 'add-student', component: AddStudentComponent }, 
  {path: 'courses', component: Courses}, 
  {path: 'grades', component: Grades}, 
  {path: 'attendance', component: AttendanceComponent}, 
  {path: 'system', component: SettingsComponent}, 
  {path: '**', redirectTo: 'dashboard', pathMatch:'full'}
];