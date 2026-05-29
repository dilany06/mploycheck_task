import { Component, OnInit } from '@angular/core';
import { User } from '../../core/models/user.model';
import { UserForm, UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  saving = false;
  error = '';
  form: UserForm = {
    userId: '',
    name: '',
    password: 'Password@123',
    role: 'General User',
    department: 'Field Sales',
    active: true
  };

  constructor(private readonly usersApi: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersApi.list().subscribe({
      next: (response) => (this.users = response.users),
      error: (error) => {
        this.error = error.error?.message || 'Unable to load users';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }

  createUser(): void {
    this.saving = true;
    this.error = '';

    this.usersApi.create(this.form).subscribe({
      next: () => {
        this.form = {
          userId: '',
          name: '',
          password: 'Password@123',
          role: 'General User',
          department: 'Field Sales',
          active: true
        };
        this.loadUsers();
      },
      error: (error) => {
        this.error = error.error?.message || 'Unable to create user';
        this.saving = false;
      },
      complete: () => (this.saving = false)
    });
  }

  toggleUser(user: User): void {
    this.usersApi.update(user.id, { active: !user.active }).subscribe({
      next: () => this.loadUsers(),
      error: (error) => (this.error = error.error?.message || 'Unable to update user')
    });
  }
}
