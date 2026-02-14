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
import { AuthGuard } from "./auth/auth-guard";
import { LoginComponent } from "./auth/login/login";
import { EventsComponent } from "./components/events/events";

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'students', component: Students, canActivate: [AuthGuard] },
  { path: 'students/edit/:id', component: EditStudent, canActivate: [AuthGuard] },
  { path: 'students/add', component: AddStudentComponent, canActivate: [AuthGuard] },
  { path: 'courses', component: Courses, canActivate: [AuthGuard] },
  { path: 'courses/edit/:id', component: EditCourseComponent, canActivate: [AuthGuard] },
  { path: 'courses/add', component: AddCourseComponent, canActivate: [AuthGuard] },
  { path: 'grades', component: Grades, canActivate: [AuthGuard] },
  { path: 'attendance', component: AttendanceComponent, canActivate: [AuthGuard] },
  { path: 'attendance-mark', component: AttendanceMark, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'system', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
