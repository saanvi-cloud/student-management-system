import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, TopStudent, DashboardResponse } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  tops: {
    id: string;
    name: string;
    course: string | null;
    grade: string | null;
    status: string;
  }[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getDashboardData().subscribe(data => {

      this.tops = data.topStudents.map(s => ({
        id: s.student_id,
        name: s.name,
        course: s.course,
        grade: s.grade !== null ? s.grade.toString() : null,
        status: s.status
      }));
    });
  }
}


