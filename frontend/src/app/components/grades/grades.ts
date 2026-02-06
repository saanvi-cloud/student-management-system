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
  selectedGrade: Grade | null = null;

  viewGrade(grade: Grade) {
    console.log('VIEW CLICKED:', grade);
    this.selectedGrade = grade;
  }
  editingGrade: Grade | null = null;

  editGrade(grade: Grade) {
    this.editingGrade = { ...grade };
  }

  saveEdit() {
    if (!this.editingGrade) return;

    this.gradeService.updateGrade(this.editingGrade).subscribe({
      next: () => {
        this.gradeService.loadGrades(); // refresh list
        this.editingGrade = null;       // close edit
      },
      error: (err) => {
        console.error('Update failed', err);
      }
    });
  }

  cancelEdit() {
    this.editingGrade = null;
  }

  expandedGradeId: string | null = null;

  toggleView(grade: any) {
    if (this.expandedGradeId === grade.student_id + grade.course_id) {
      this.expandedGradeId = null;
    } else {
      this.expandedGradeId = grade.student_id + grade.course_id;
    }
  }

  isExpanded(grade: any): boolean {
    return this.expandedGradeId === grade.student_id + grade.course_id;
  }
  deleteGrade(grade: Grade) {
    if (confirm('Are you sure you want to delete this grade?')) {

      this.gradeService
        .deleteGrade(grade.student_id, grade.course_id)
        .subscribe({
          next: () => {
            this.gradeService.loadGrades(); // refresh table
          },
          error: (err) => {
            console.error('Delete failed', err);
          }
        });
    }
  }
}
