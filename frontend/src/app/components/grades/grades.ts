import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grade } from '../../models/grade.model';
import { GradeService } from '../../services/grade.service';

@Component({
  selector: 'app-grades', 
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades implements OnInit {
  grades: Grade[] = [];

  constructor (private gradeService: GradeService) {}

  ngOnInit(): void {
    this.gradeService.getGrades().subscribe(data => {
      console.log('Grades: ', data);
      this.grades = data;
    });
  }
}