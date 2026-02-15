import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, TopStudent, DashboardResponse } from '../../models/dashboard.model';
import { SchoolEvent } from '../../models/event.model';
import { EventService } from '../../services/event.service';

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
  upcomingEvents: SchoolEvent[] = [];
  recentActivities: any[] = [];

  constructor(private dashboardService: DashboardService, private eventService: EventService) {}

  ngOnInit() {

    // Dashboard Data
    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        this.tops = data.topStudents;
        this.stats = data.stats;
      },
      error: err => console.error(err)
    });

    // Upcoming Events
    this.eventService.getEvents().subscribe({
      next: (res) => {
        console.log("EVENTS FROM API:", res);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.upcomingEvents = res
          .filter(e => {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      },
      error: (err) => {
        console.error("EVENT FETCH ERROR:", err);
      }
    });

    this.dashboardService.getRecentActivity().subscribe({
      next: (res) => {
        this.recentActivities = res;
      }
    });

  }
  getIcon(type: string) {
    if (type === 'ADD_STUDENT') return 'fa-solid fa-user-plus text-[16px] ml-2 mt-1 text-green-400';
    if (type === 'UPDATE_STUDENT') return 'fa-solid fa-pen-to-square text-[16px] ml-2 mt-1 text-orange-400';
    if (type === 'DELETE_STUDENT') return 'fa-solid fa-user-minus text-[16px] ml-2 mt-1 text-red-400';
    return 'fa-solid fa-circle-info text-[16px] ml-2 mt-1 text-blue-400';
  }

}