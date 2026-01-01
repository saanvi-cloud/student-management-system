import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  courses = [
  { code:'4CS101',	name:'Introduction to Programming',	instructor:'Dr. Alan Smith',	enrolled:45,	schedule:'Mon/Wed 10:00 AM'}, 
  { code:'BUS202',	name:'Business Management',	instructor:'Prof. Sarah Johnson',	enrolled:38,	schedule:'Tue/Thu 2:00 PM'}, 
  { code:'ENG150',	name:'Engineering Principles',	instructor:'Dr. Robert Chen',	enrolled:52,	schedule:'Mon/Fri 9:00 AM'}, 
];
}
