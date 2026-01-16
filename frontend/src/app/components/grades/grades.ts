import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeService } from '../../services/grade.service';
import { Grade } from '../../models/grade.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades implements OnInit {

  grades$!: Observable<Grade[] | null>;

  constructor(private gradeService: GradeService) {}

  ngOnInit(): void {
    this.grades$ = this.gradeService.grades$;
    this.gradeService.loadGrades();
  }

  loadGrades(): void {
    this.gradeService.loadGrades();
  }
}
