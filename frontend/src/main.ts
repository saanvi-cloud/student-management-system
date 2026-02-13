import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import 'zone.js';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth-interceptor';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideCalendar } from 'angular-calendar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideZoneChangeDetection(), 
    provideAnimations(),
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    )
  ]
});
