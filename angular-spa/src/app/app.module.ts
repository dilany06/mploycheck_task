import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { Observable } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';
import { LoginComponent } from './features/auth/login.component';
import { WorkspaceComponent } from './features/workspace/workspace.component';
import { AdminUsersComponent } from './features/admin/admin-users.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'workspace', component: WorkspaceComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard], data: { adminOnly: true } },
  { path: '', pathMatch: 'full', redirectTo: 'workspace' },
  { path: '**', redirectTo: 'workspace' }
];

function loadCurrentSession(auth: AuthService): () => Observable<boolean> {
  return () => auth.loadSession();
}

@NgModule({
  declarations: [AppComponent, LoginComponent, WorkspaceComponent, AdminUsersComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadCurrentSession,
      deps: [AuthService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
