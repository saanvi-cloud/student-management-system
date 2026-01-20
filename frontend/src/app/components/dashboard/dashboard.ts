import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, TopStudent, DashboardResponse } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})

export class Dashboard implements OnInit {

  tops: TopStudent[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    console.log('Dashboard component initialized');
    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        console.log('Dashboard API response:', data);
        this.tops = data.topStudents;
      },
      error: err => console.error(err)
    });
  }
}