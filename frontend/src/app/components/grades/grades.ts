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
  modifiedGrades: Grade[] = [];
  originalGrades: Grade [] = [];
  isUpdating = false;

  grades$!: Observable<Grade[] | null>;

  constructor(private gradeService: GradeService) {}

  ngOnInit(): void {
    this.gradeService.grades$.subscribe(data => {
      console.log("GRADES RECEIVED:", data);
      if (data) {
        this.allGrades = data;
        this.originalGrades = JSON.parse(JSON.stringify(data));
        this.extractCourses(data);
        this.applyFilters();
      }
    });

    this.gradeService.loadGrades();
  }

  // loadGrades() {
  //   this.gradeService.getGrades().subscribe(data => {
  //     this.grades = data;
  //     this.originalGrades = JSON.parse(JSON.stringify(data));
  //   });
  // }
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

  markAsModified(grade: Grade) {
    const original = this.originalGrades.find(
      g => g.student_id === grade.student_id &&
          g.course_id === grade.course_id
    );

    if (!original) return;

    const alreadyModified = this.modifiedGrades.find(
      g => g.student_id === grade.student_id &&
          g.course_id === grade.course_id
    );

    // If value changed → add to modified
    if (original.grade_numeric !== grade.grade_numeric) {

      if (!alreadyModified) {
        this.modifiedGrades.push({ ...grade });
      }

    } else {
      // If user reverted back → remove from modified
      this.modifiedGrades = this.modifiedGrades.filter(
        g => !(g.student_id === grade.student_id &&
              g.course_id === grade.course_id)
      );
    }
  }

  bulkUpdate() {
    if (this.modifiedGrades.length === 0) {
      alert("No changes to update");
      return;
    }

    this.isUpdating = true;

    this.gradeService.bulkUpdate({
      grades: this.modifiedGrades,
      courseId: this.selectedCourse
    }).subscribe({
      next: () => {

        // update baseline AFTER backend success
        this.originalGrades = JSON.parse(JSON.stringify(this.allGrades));
        this.gradeService.loadGrades();
        this.modifiedGrades = [];
        this.isUpdating = false;

        alert("Bulk update successful");
      },
      error: err => {
        this.isUpdating = false;
        console.error("Bulk update failed:", err);
      }
    });
  }

  isModified(grade: Grade): boolean {
    return this.modifiedGrades.some(
      g => g.student_id === grade.student_id &&
          g.course_id === grade.course_id
    );
  }
  // onGradeChange(grade: Grade) {
  //   // Update letter instantly in UI
  //   grade.grade_letter = this.calculateLetter(grade.grade_numeric);

  //   this.markAsModified(grade);
  // }
  // onGradeChange(grade: Grade) {
  //   const numeric = Number(grade.grade_numeric);

  //   grade.grade_letter = this.calculateLetter(numeric);
  //   grade.performance = this.calculatePerformance(grade.grade_letter);

  //   this.markAsModified(grade);
  // }

  // calculateLetter(score: number): string {
  //   if (score >= 90) return 'A';
  //   if (score >= 80) return 'B';
  //   if (score >= 70) return 'C';
  //   if (score >= 60) return 'D';
  //   if (score >= 50) return 'E';
  //   return 'F';
  // }
  // calculatePerformance(letter: string): string {
  //   switch (letter) {
  //     case 'A': return 'Excellent';
  //     case 'B': return 'Very Good';
  //     case 'C': return 'Good';
  //     case 'D': return 'Average';
  //     case 'E': return 'Lower Average';
  //     case 'F': return 'Fail';
  //     default: return '';
  //   }
  // }
  onGradeChange(grade: Grade) {
    grade.grade_numeric = Number(grade.grade_numeric);
    this.markAsModified(grade);
  }
  trackByGrade(index: number, grade: Grade): string {
    return grade.student_id + '-' + grade.course_id;
  }
}
