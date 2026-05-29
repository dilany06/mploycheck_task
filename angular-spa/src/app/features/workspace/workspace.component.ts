import { Component, OnInit } from '@angular/core';
import { User } from '../../core/models/user.model';
import { WorkRecord } from '../../core/models/record.model';
import { AuthService } from '../../core/services/auth.service';
import { RecordService } from '../../core/services/record.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {
  user: User | null = null;
  records: WorkRecord[] = [];
  accessNote = '';
  delay = 1600;
  loading = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly recordsApi: RecordService) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.error = '';

    this.recordsApi.list(this.delay).subscribe({
      next: (response) => {
        this.records = response.records;
        this.accessNote = response.accessNote;
      },
      error: (error) => {
        this.error = error.error?.message || 'Unable to load records';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
