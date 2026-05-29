import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  loadSession(): Observable<boolean> {
    if (!localStorage.getItem('mini-crm-token')) {
      return of(true);
    }

    return this.api.get<{ user: User }>('/auth/me').pipe(
      tap((response) => this.currentUserSubject.next(response.user)),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(true);
      })
    );
  }

  login(payload: LoginRequest): Observable<User> {
    return this.api.post<LoginResponse>('/auth/login', payload, 700).pipe(
      tap((response) => {
        localStorage.setItem('mini-crm-token', response.token);
        this.currentUserSubject.next(response.user);
      }),
      map((response) => response.user)
    );
  }

  logout(): void {
    localStorage.removeItem('mini-crm-token');
    this.currentUserSubject.next(null);
  }
}
