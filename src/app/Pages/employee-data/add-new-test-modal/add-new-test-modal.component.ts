import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ReportVM } from '../models/report.model';
import { TestField } from '../models/report.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-add-new-test-modal',
  imports: [FormsModule,CommonModule],
  templateUrl: './add-new-test-modal.component.html',
  styleUrl: './add-new-test-modal.component.css'
})
export class AddNewTestModalComponent {
  newTestName:string='';
  sessionFullName: string = '';
  clientInfo: string = '';
  test: any = {
    userId: 0,
    testId: 0,
    reportId: 0,
    name: '',
    testTypeId: 0,
    testFields: [],
    testNotes: [],
    type: '',
    pageNo: 0,
    notes: ''
  };

constructor(private sanitizer: DomSanitizer, private http: HttpClient) { }
  router = inject(Router);
  @Input() reports: ReportVM | null = null;  // Define the reports property with @Input decorator
  @Output() close = new EventEmitter<void>();
  get sanitizedPdfPath(): SafeResourceUrl | null {
    if (!this.reports?.Report?.filePath) return null;

    const baseUrl = 'https://staging.themedibank.in/patientfiles/';
    const normalizedPath = this.reports.Report.filePath.replace(/\\/g, '/');
    const fullPath = baseUrl + normalizedPath;

    return this.sanitizer.bypassSecurityTrustResourceUrl(fullPath);
  }

   closeModal() {
    this.close.emit();
  }
  addRowAfter(index: number) {
    const newRow: TestField = {
      testFieldId: 0,
      testId: 0,
      name: '',
      value: '',
      testValue: 0,
      unit: '',
      severity: '',
      range: {
        min: '',
        operator: '',
        max: ''
      },
      testFieldRanges: [],
      colour: '',
      createdAt: '',
      createdBy: '',
      createdOn: new Date()
    };

    this.reports?.Report.tests[0].testFields.splice(index + 1, 0, newRow);
  }

  deleteRow(index: number) {
    this.reports?.Report.tests[0].testFields.splice(index, 1);
  }
}
