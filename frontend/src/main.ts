import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import 'zone.js';
import { provideZoneChangeDetection } from '@angular/core';
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth-interceptor';
import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideZoneChangeDetection()
  ]
});
