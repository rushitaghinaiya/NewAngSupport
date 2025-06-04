import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ReportVM } from '../models/report.model';
import { TestField } from '../models/report.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { API_BASE_URL } from '../../../config/constants';

@Component({
  standalone: true,
  selector: 'app-add-test-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-test-modal.component.html',
  styleUrl: './add-test-modal.component.css'
})
export class AddTestModalComponent {
  private baseUrl = API_BASE_URL;
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


  onSubmit() {

  }

  updateTest(): void {
    debugger;
    const apiUrl = `${this.baseUrl}api/v1/Report/UpdateTest`;
    const isFirst = localStorage.getItem("isFirst") === "true";
    this.sessionFullName = localStorage.getItem("supportFullName") ?? "";



    const now = new Date().toISOString();
    const severityList = [
      "Normal (for age > 60 years)", "Normal (High for Male)", "normal (Low)",
      "Normal (Adult Male 21 - 49 Yrs)", "Normal", "Normal/desirable/optimal",
      "sufficiency", "optimal", "negative risk factor", "normal for age > 60 years",
      "sufficient", "normal for age > 60", "near optimal", "Normal for age",
      "Normal for age <= 60 years", "normal/desirable/optimal/negative risk factor",
      "normal", "Fair Control", "Good Control", "desirable", "near optimal",
      "non-reactive", "low risk", "Slightly Above Normal", "Normal for Adult Female Pre-Menopause",
      "Normal (for age group)", "Normal for Male"
    ];

    const testList = this.reports?.Report?.tests;
    if (!testList) {
      console.error("tests is undefined");
      return;
    }

    const tests = testList.map(test => {
      const updatedTestFields = test.testFields.map(field => ({
        ...field,
        TestId: test.testId,
        FrzInd: false,
        CreatedOn: now,
        UpdatedOn: now,
        CreatedBy: this.sessionFullName,
        UpdatedBy: this.sessionFullName,
        CreatedAt: this.clientInfo,
        UpdatedAt: this.clientInfo,
        Colour: severityList.includes(field.severity) ? 'green' : 'red'
      }));

      const updatedTestNotes = test.testNotes.map(note => ({
        ...note,
        TestId: test.testId,
        FrzInd: false,
        CreatedOn: now,
        UpdatedOn: now,
        CreatedBy: this.sessionFullName,
        UpdatedBy: this.sessionFullName,
        CreatedAt: this.clientInfo,
        UpdatedAt: this.clientInfo
      }));

      return {
        ...test,
        FrzInd: false,
        UpdatedOn: now,
        UpdatedBy: this.sessionFullName,
        UpdatedAt: this.clientInfo,
        TestFields: updatedTestFields,
        TestNotes: updatedTestNotes,
        IsFirst: isFirst
      };
    });

    const postData = JSON.stringify(tests[0]);

    this.http.post(apiUrl, postData, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        debugger;
        if (response.statusMessage === 'success') {
          alert("Test updated successfully");
          this.router.navigate(['/report'], {
            queryParams: { id: this.reports?.Report.reportId, isFirst }
          });
        } else {
          alert("Unable to update test. Please try again.");
        }
      },
      error: (error) => {
        console.error("Error updating test", error);
        alert("Server error while updating test.");
      }
    });

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
