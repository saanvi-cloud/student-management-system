import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarEvent } from 'angular-calendar';
import { EventService } from '../../services/event.service';
import { SchoolEvent } from '../../models/event.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {

  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  filteredEvents: SchoolEvent[] = [];

  private allEvents: SchoolEvent[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.eventService.getEvents().subscribe((res: SchoolEvent[]) => {
      this.allEvents = res;

      this.calendarEvents = res.map(e => ({
        start: new Date(e.date),
        title: e.description,
        color: this.getEventColor(e.type),
        allDay: true
      }));

      this.filterByMonth();
    });
  }

  previousMonth() {
    const date = new Date(this.viewDate);
    date.setMonth(date.getMonth() - 1);
    this.viewDate = date;
    this.filterByMonth();
  }

  nextMonth() {
    const date = new Date(this.viewDate);
    date.setMonth(date.getMonth() + 1);
    this.viewDate = date;
    this.filterByMonth();
  }

  filterByMonth() {
    this.filteredEvents = this.allEvents.filter(e => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getMonth() === this.viewDate.getMonth() &&
        eventDate.getFullYear() === this.viewDate.getFullYear()
      );
    });
  }

  getEventColor(type: string) {
    if (type === 'exam') {
      return { primary: '#dc2626', secondary: '#fee2e2' };
    }
    if (type === 'competition') {
      return { primary: '#16a34a', secondary: '#dcfce7' };
    }
    return { primary: '#2563eb', secondary: '#dbeafe' };
  }
}
