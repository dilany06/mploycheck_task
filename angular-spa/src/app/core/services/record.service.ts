import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecordResponse } from '../models/record.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RecordService {
  constructor(private readonly api: ApiService) {}

  list(delay: number): Observable<RecordResponse> {
    return this.api.get<RecordResponse>('/records', delay);
  }
}
