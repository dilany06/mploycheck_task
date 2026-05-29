import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  userId = 'admin';
  password = 'Admin@123';
  role: Role = 'Admin';
  loading = false;
  error = '';

  readonly roles: Role[] = ['General User', 'Admin'];

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  login(): void {
    this.loading = true;
    this.error = '';

    this.auth.login({ userId: this.userId, password: this.password, role: this.role }).subscribe({
      next: () => this.router.navigateByUrl('/workspace'),
      error: (error) => {
        this.error = error.error?.message || 'Login failed';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }

  fillDemo(role: Role): void {
    this.role = role;
    this.userId = role === 'Admin' ? 'admin' : 'general';
    this.password = role === 'Admin' ? 'Admin@123' : 'User@123';
  }
}
