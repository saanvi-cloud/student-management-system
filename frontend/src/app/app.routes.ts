import { Routes } from "@angular/router";
import { Dashboard } from './components/dashboard/dashboard';
import { Students } from './components/students/students';
import { Courses } from './components/courses/courses';
import { AddStudentComponent } from './components/add-student/add-student';
import { Grades } from './components/grades/grades';
import { AttendanceComponent } from './components/attendance/attendance';
import { SettingsComponent } from './components/system/system';
import { EditStudent } from "./components/students/edit-student/edit-student";
import { EditCourseComponent } from "./pages/edit-course/edit-course";
import { AddCourseComponent } from "./pages/add-course/add-course";
import { AttendanceMark } from "./components/attendance-mark/attendance-mark";

export const routes: Routes = [
  {path: '', redirectTo:'dashboard', pathMatch:'full'}, 
  {path: 'dashboard', component: Dashboard}, 
  {path: 'students', component: Students}, 
  { path: 'students/edit/:id', component: EditStudent },
  {path: 'add-student', component: AddStudentComponent }, 
  {path: 'courses', component: Courses}, 
  {path: 'courses/edit/:id', component: EditCourseComponent},
  {path: 'courses/add', component: AddCourseComponent }, 
  {path: 'grades', component: Grades}, 
  {path: 'attendance', component: AttendanceComponent},
  {path: 'attendance-mark', component: AttendanceMark}, 
  {path: 'system', component: SettingsComponent}, 
  {path: '**', redirectTo: 'dashboard', pathMatch:'full'}
];