import { Component } from '@angular/core';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
    next: (res: any) => {
      console.log(res);
      localStorage.setItem('token', res.token);
      console.log("Saved token:", localStorage.getItem('token'));
      localStorage.setItem('logId', res.logId);
      this.router.navigate(['/dashboard']);
    },
      error: (err) => {
        alert('Invalid credentials');
      }
    });
  }
  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
