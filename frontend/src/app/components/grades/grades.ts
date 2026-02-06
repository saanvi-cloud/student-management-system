import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeService } from '../../services/grade.service';
import { Grade } from '../../models/grade.model';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades implements OnInit {
  
  courses: string[] = [];
  selectedCourse: string = '';
  selectedGradeRange: string = '';
  allGrades: Grade[] = [];


  grades$!: Observable<Grade[] | null>;

  constructor(private gradeService: GradeService) {}

  ngOnInit(): void {
    this.gradeService.grades$.subscribe(data => {
      console.log("GRADES RECEIVED:", data);
      if (data) {
        this.allGrades = data;
        this.extractCourses(data);
        this.applyFilters();
      }
    });

    this.gradeService.loadGrades();
  }

  loadGrades(): void {
    this.gradeService.loadGrades();
  }
  filteredGrades: Grade[] = [];

  applyFilters() {
    this.filteredGrades = this.allGrades.filter(g => {

      const courseMatch =
        !this.selectedCourse ||
        g.course_name === this.selectedCourse;

      const gradeMatch =
        !this.selectedGradeRange ||
        g.grade_letter === this.selectedGradeRange;

      return courseMatch && gradeMatch;
    });
  }
    extractCourses(data: Grade[]) {
    const uniqueCourses = new Set(data.map(g => g.course_name));
    this.courses = Array.from(uniqueCourses);
  }
}
