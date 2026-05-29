import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.currentUser) {
      return this.router.parseUrl('/login');
    }

    if (route.data['adminOnly'] && !this.auth.isAdmin) {
      return this.router.parseUrl('/workspace');
    }

    return true;
  }
}
