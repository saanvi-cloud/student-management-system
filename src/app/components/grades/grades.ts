import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grades',
  imports: [CommonModule],
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades {
  getletterGrade (mark: number): string {
    if (mark >= 90) return 'A';
    if (mark >= 80 && mark <= 89) return 'B';
    if (mark >= 70 && mark <= 79) return 'C';
    if (mark >= 60 && mark <= 69) return 'D';
    if (mark >= 50 && mark <= 59) return 'E';
    return 'F';
  }
  getPerformance (mark: number): string {
    if (mark >= 90) return 'Excellent';
    if (mark >= 80 && mark <= 89) return 'Very Good';
    if (mark >= 70 && mark <= 79) return 'Good';
    if (mark >= 60 && mark <= 69) return 'Average';
    if (mark >= 50 && mark <= 59) return 'Below Average';
    return 'Bad';
  }
  getActions (mark: number): string {
    if (mark >= 75) return '--';
    else return 'Needs Improvement';
  }
  grades = [
    {
      id:1, 
      studentName:'John Doe', 
      course:'Computer Science',
      grade:92
    }, 
    {
      id:2, 
      studentName:'Jane Smith', 
      course:'Business Administration',
      grade:85
    }, 
    {
      id:5, 
      studentName:'Michael Brown', 
      course:'Arts',
      grade: 72
    }
  ];
}
