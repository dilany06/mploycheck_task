import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:5001/api';

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, delay = 0): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers(), params: this.delayParams(delay) });
  }

  post<T>(path: string, body: unknown, delay = 0): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers: this.headers(),
      params: this.delayParams(delay)
    });
  }

  patch<T>(path: string, body: unknown, delay = 0): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, {
      headers: this.headers(),
      params: this.delayParams(delay)
    });
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('mini-crm-token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private delayParams(delay: number): HttpParams {
    return delay > 0 ? new HttpParams().set('delay', delay) : new HttpParams();
  }
}
