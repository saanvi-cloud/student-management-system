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
  stats!: DashboardStats;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        this.tops = data.topStudents;
        this.stats = data.stats;
      },
      error: err => console.error(err)
    });
  }
}