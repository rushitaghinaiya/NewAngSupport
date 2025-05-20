import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Test } from '../models/report.model';
import { TestField } from '../models/report.model';
import { Report } from '../models/report.model';
import { ReportVM } from '../models/report.model';
import { CommonModule } from '@angular/common';
import { AddTestModalComponent } from '../add-test-modal/add-test-modal.component';
import { AddNewTestModalComponent } from '../add-new-test-modal/add-new-test-modal.component'
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportType } from '../models/report.model';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddTestModalComponent, AddNewTestModalComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {
  Test = {
    name: ''
  };
  reportId!: number;
  isFirst!: boolean;
  testData: Test | null = null;
  report: Report | null = null;
  reports: ReportVM = {
    VerifiedReports: [],
    UnverifiedReports: [],
    Report: {} as Report, // or null if that's acceptable in your logic
    Test: {
      userId: 0,
      testId: 0,
      reportId: 0,
      name: '',
      testTypeId: 0,
      testFields: [] as any[],
      testNotes: [] as any[],
      type: '',
      pageNo: 0,
      notes: ''
    } as Test,
    TestTypes: [],
    BloodReportTypes: {} as ReportType[],
    OtherReason: ''
  };
  showAddTestModal = false;
  showAddNewTestModal = false;
  selectedDivId: string = 'divTest_0';
  pdfUrl!: SafeResourceUrl;

  router = inject(Router);
  constructor(private route: ActivatedRoute, private http: HttpClient, private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    debugger;
    this.route.queryParams.subscribe(params => {
      this.reportId = +params['id'];
      this.isFirst = params['isFirst'] === 'true';
    });
    this.loadReportData();

    this.addEmptyTestField();
  }

  loadReportData(): void {
    this.http.get(`https://localhost:7050/api/v1/Report/GetReportById?Reportid=${this.reportId}`).subscribe((res: any) => {
      this.reports.Report = res.responseData;
      let action = 'getreport';
debugger;
      switch (this.reports.Report.reportTypeId) {
        case 1:
          action = 'getprescription';
          break;
        case 2:
          action = 'gethospitalization';
          break;
      }

      if (action === 'getprescription') {
        this.router.navigate(['/prescription'], { queryParams: { report: JSON.stringify(this.reports.Report) } });
      }
      if (action === 'gethospitalization') {
        this.router.navigate(['/hospitalization'], { queryParams: { report: JSON.stringify(this.reports.Report) } });
      }
      const baseUrl = 'https://staging.themedibank.in/patientfiles/';
      const normalizedPath = this.reports.Report?.filePath.replace(/\\/g, '/');
      const fullPath = baseUrl + normalizedPath;

      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullPath);
    });

    this.http.get(`https://localhost:7050/api/v1/Report/GetReportsType`).subscribe((res: any) => {
      this.reports.BloodReportTypes = res.responseData;
    });
  }


  addEmptyTestField() {
    this.reports.Test.testFields.push({
      testFieldId: 0,
      testId: 0,
      name: '',
      value: '',
      testValue: 0,
      unit: '',
      severity: '',
      range: {
        min: '',
        max: '',
        operator: ''
      },
      testFieldRanges: [
        {
          Value1: '',
          Value2: '',
          operator: '',
          Description: '',
        }
      ],
      colour: '',
      createdAt: '',
      createdBy: '',
      createdOn: new Date()
    });
  }
  openAddTestModal(): void {
    const index = Number(this.selectedDivId?.split('_')[1]);
    const selectedTest = this.report?.tests?.[index];
    const testId = selectedTest?.testId;

    const apiUrl = `https://localhost:7050/api/v1/Report/GetTestByTestId?TestId=${testId}`; // replace with actual API
    this.http.get(apiUrl).subscribe((res: any) => {
      this.reports ??= {} as ReportVM;
      this.reports.Test = res?.responseData;
      if (this.reports) {
        this.http.get(`https://localhost:7050/api/v1/Report/GetReportById?ReportId=${this.reportId}`).subscribe((res: any) => {
          const reportData = res?.responseData;
          debugger;
          if (reportData) {
            if (this.reports) {
              this.reports.Report = reportData;
            }  // Merge report data (if needed)
            if (this.reports && this.reports.Report) {
              this.reports.Report.tests = [];
              this.reports.Report.tests.push(this.reports.Test);
            }
          }
          this.http.get(`https://localhost:7050/api/v1/Report/GetTestField?TestId=${testId}`).subscribe((res: any) => {
            debugger;
            if (this.reports?.Report?.tests) {
              this.reports.Report.tests[0].testFields = res.responseData;
              this.showAddTestModal = true;  // Open the modal with the test data
              debugger;
            }
          });
        });
      }
    });

  }

  onCloseModal(): void {
    this.showAddTestModal = false;
  }
  onCloseTestModal(): void {
    this.showAddNewTestModal = false;
  }
  getRangeDescription(range: any): string {
    let desc = '';
    if (range.description?.trim()) {
      desc += range.description + ': ';
    }
    if (range.operator?.trim()) {
      desc += `${range.value1} ${range.operator} ${range.value2}`;
    } else {
      desc += `${range.value1} ${this.displayOperator(range.operators)} ${range.value2}`;
    }
    return desc;
  }
  displayOperator(op: string): string {
    // Translate operators if needed, like converting enums
    return op || '';
  }

  // Add new test
  openAddNewTestModal(): void {
    debugger;
    this.showAddNewTestModal = true;
  }
  closeModal() {
    this.showAddNewTestModal = false;
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
      colour: '',
      createdAt: '',
      createdBy: '',
      createdOn: new Date(),
      testFieldRanges: []
    };

    this.reports?.Report.tests[0].testFields.splice(index + 1, 0, newRow);
  }

  deleteRow(index: number) {
    this.reports?.Report.tests[0].testFields.splice(index, 1);
  }

  deleteTestRow(index: number) {
    this.reports?.Test.testFields.splice(index, 1);
  }


  addNewTest(): void {
    debugger;
    try {
      const isFirst = localStorage.getItem('isFirst') === 'true'; // or from a shared service
      const currentDate = new Date();

      const createdBy = localStorage.getItem("FullName") || 'System';
      const createdAt = localStorage.getItem("ClientInfo") || 'Unknown';

      // Set common fields
      this.reports.Test.createdOn = currentDate;
      this.reports.Test.createdBy = createdBy;
      this.reports.Test.createdAt = createdAt;

      const severityList: string[] = [
        "Normal (for age > 60 years)", "Normal (High for Male)", "normal (Low)", "Normal (Adult Male 21 - 49 Yrs)", "Normal",
        "Normal/desirable/optimal", "sufficiency", "optimal", "negative risk factor", "normal for age > 60 years", "sufficient",
        "normal for age > 60", "near optimal", "Normal for age", "Normal for age <= 60 years",
        "normal/desirable/optimal/negative risk factor", "normal", "Fair Control", "Good Control", "desirable", "near optimal",
        "non-reactive", "low risk", "Slightly Above Normal", "Normal for Adult Female Pre-Menopause", "Normal (for age group)",
        "Normal for Male"
      ];

      // Set details for each test field
      this.reports.Test.testFields = this.reports.Test.testFields.map(field => {
        field.createdOn = currentDate;
        field.createdBy = createdBy;
        field.createdAt = createdAt;
        field.colour = severityList.includes(field.severity) ? 'green' : 'red';
        return field;
      });
      this.report = this.reports.Report
      if (this.report && this.reports.Report) {
        this.report.reportId = this.reports.Report.reportId;
        this.report.tests = []; // Clear old data
        this.report.tests.push(this.reports.Test);
        this.report.supportUserType = 2;
      }
      // Final report object to send
      const finalReport = {
        reportId: this.reports.Report.reportId,
        supportUserType: localStorage.getItem("supportUserType"),
        isFirstOrPeer: isFirst,
        selectedTestId: this.reports.Report.selectedTestId,
        tests: [this.reports.Test]
      };
      console.log(this.report);
      // API call
      this.http.post<any>('https://localhost:7050/api/v1/Report/SaveTestReports', this.report)
        .subscribe({
          next: (response) => {
            if (response.statusCode === 200 && response.statusMessage === 'success') {
              alert('Test successfully added.');
              this.showAddNewTestModal = false;
              this.loadReportData();
            } else {
              alert('Unable to save Test. Please try again later.');
            }
          },
          error: (err) => {
            console.error('API Error:', err);
            alert('An unexpected error occurred.');
          }
        });

    } catch (err) {
      console.error('Exception:', err);
    }
  }

}
