import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Test } from '../models/report.model';
import { TestField } from '../models/report.model';
import { Report } from '../models/report.model';
import { ReportVM } from '../models/report.model';
import { CommonModule } from '@angular/common';
import { AddTestModalComponent } from '../add-test-modal/add-test-modal.component';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportType } from '../models/report.model';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { Support } from '../models/support';
@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddTestModalComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {
  Test = {
    name: ''
  };
  sessionFullName: string = '';
  clientInfo: string = '';
  editIndex: number | null = null;
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
  support :Support= {
    fullName:'',
  };
  showAddTestModal = false;
  showAddNewTestModal = false;
  selectedDivId: string = 'divTest_0';
  pdfUrl!: SafeResourceUrl;

  router = inject(Router);
  constructor(private route: ActivatedRoute, private http: HttpClient, private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      this.reportId = +params['id'];
      this.isFirst = params['isFirst'] === 'true';
    });
    
    const supportData = localStorage.getItem('support');
   
    if (supportData) {
      this.support = JSON.parse(supportData);
    }
    this.loadReportData();

    this.addEmptyTestField();
  }

  loadReportData(): void {
    
    this.http.get(`https://localhost:7050/api/v1/Report/GetReportById?Reportid=${this.reportId}`).subscribe((res: any) => {
      this.reports.Report = res.responseData;
      if (this.reports?.Report?.tests?.length > 0) {
        this.reports.Report.selectedTestId = this.reports.Report.tests[0].testId;
      }
      let action = 'getreport';
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

  VerifyTest() {
    
    const reportVm = this.reports;
    const isFirstOrPeer = localStorage.getItem("isFirst") === "true";
    const storedData = localStorage.getItem('userApp');
    let userdata = [];
    if (storedData) {
      userdata = JSON.parse(storedData);
    }
    
    if (reportVm?.Report) {
      const test: Test = {
        testId: reportVm.Report.selectedTestId ?? 0,
        reportId: reportVm.Report.reportId,
        updatedBy:this.support.fullName || '',
        updatedOn: new Date(),
        updatedAt: 'system',
        isFirst: isFirstOrPeer,
        userId: userdata.userId,
        testFields: [],
        testNotes: []
      };
    

    this.http.post<any>('https://localhost:7050/api/v1/Report/VerifyTest', test)
      .subscribe({
        next: (response) => {
          
          if (response.statusCode === 200 && response.statusMessage === 'success') {
            alert('Report successfully verified.');
            //Redirect to homepage
            this.router.navigateByUrl("user-list")
          } else {
            alert('Unable to verify Report. Please try again later.');
          }
        },
        error: (err) => {
          console.error('API Error:', err);
          alert('An unexpected error occurred.');
        }
      });
    }
  }

  openAddTestModal(): void {
    
    const index = Number(this.selectedDivId?.split('_')[1]);
    const selectedTest = this.reports?.Report.tests?.[index];
    const testId = selectedTest?.testId;

    const apiUrl = `https://localhost:7050/api/v1/Report/GetTestByTestId?TestId=${testId}`; // replace with actual API
    this.http.get(apiUrl).subscribe((res: any) => {
      this.reports ??= {} as ReportVM;
      this.reports.Test = res?.responseData;
      if (this.reports) {
        this.http.get(`https://localhost:7050/api/v1/Report/GetReportById?ReportId=${this.reportId}`).subscribe((res: any) => {
          const reportData = res?.responseData;
          
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
            
            if (this.reports?.Report?.tests) {
              this.reports.Report.tests[0].testFields = res.responseData;
              this.showAddTestModal = true;  // Open the modal with the test data
              
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
    
    this.showAddNewTestModal = true;
  }
  closeModal() {
    this.showAddNewTestModal = false;
  }
  addRowAfter(testFieldId: number) {
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

  const tests = this.reports?.Report.tests;

  if (tests) {
    for (let test of tests) {
      const index = test.testFields.findIndex(field => field.testFieldId === testFieldId);
      if (index !== -1) {
        test.testFields.splice(index + 1, 0, newRow);
        this.editIndex = index + 1;

        // Force refresh the array if needed by Angular
        test.testFields = [...test.testFields];
        break;
      }
    }
  }
}

  enableEdit(index: number) {
    this.editIndex = index;
  }
 deleteRow(testFieldId: number) {
  debugger;
  const tests = this.reports?.Report.tests;

  if (tests) {
    for (let test of tests) {
      const index = test.testFields.findIndex(field => field.testFieldId === testFieldId);
      if (index !== -1) {
        test.testFields.splice(index, 1);
        break; // Exit once deleted
      }
    }
  }
}


  deleteTestRow(index: number) {
    this.reports?.Test.testFields.splice(index, 1);
  }


  addNewTest(): void {
    
    try {
      const isFirst = localStorage.getItem('isFirst') === 'true'; // or from a shared service
      const currentDate = new Date();

      const createdBy = this.support.fullName || 'System';
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
  updateTest(): void {
    debugger;
    const tid=this.reports.Report.selectedTestId;
    const apiUrl = 'https://localhost:7050/api/v1/Report/UpdateTest';
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

    const ind = tests.findIndex(field => field.testId == tid);
    const postData = JSON.stringify(tests[ind]);

    this.http.post(apiUrl, postData, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        
        if (response.statusMessage === 'success') {
          alert("Test updated successfully");
          this.loadReportData();
        } else {
          alert("Unable to update test. Please try again.");
        }
      },
      error: (error) => {
        console.error("Error updating test", error);
        alert("Server error while updating test.");
      }
    });
    this.editIndex = null;

  }

  editIndexFn(): void {
    this.editIndex = null;
  }
}
