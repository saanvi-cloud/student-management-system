import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-courses', 
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  courses: Course[] = [];

  constructor (private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => { 
      console.log('Courses:', data);
      this.courses = data;
    });
  }
}
