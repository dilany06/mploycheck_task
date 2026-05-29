import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

export interface UserForm {
  userId?: string;
  name: string;
  password?: string;
  role: User['role'];
  department: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly api: ApiService) {}

  list(delay = 600): Observable<{ users: User[] }> {
    return this.api.get<{ users: User[] }>('/users', delay);
  }

  create(payload: UserForm): Observable<{ user: User }> {
    return this.api.post<{ user: User }>('/users', payload, 400);
  }

  update(id: string, payload: Partial<UserForm>): Observable<{ user: User }> {
    return this.api.patch<{ user: User }>(`/users/${id}`, payload, 400);
  }
}
