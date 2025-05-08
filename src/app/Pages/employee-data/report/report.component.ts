import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Test } from '../models/report.model';
import { Report } from '../models/report.model';
import { ReportVM } from '../models/report.model';
import { CommonModule } from '@angular/common';
import { AddTestModalComponent } from '../add-test-modal/add-test-modal.component';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, FormsModule, AddTestModalComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {
  reportId!: number;
  isFirst!: boolean;
  testData: Test | null = null;
  report: Report | null = null;
  reports: ReportVM | null = null;
  showAddTestModal = false;
  selectedDivId: string = 'divTest_0';
  pdfUrl!: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private http: HttpClient, private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.reportId = +params['id'];
      this.isFirst = params['isFirst'] === 'true';
    });
    this.http.get(`https://localhost:7050/api/v1/Report/GetReportById?Reportid=${this.reportId}`).subscribe((res: any) => {
      this.report = res.responseData;
      console.log(this.report);
      const baseUrl = 'https://staging.themedibank.in/patientfiles/';
      const normalizedPath = this.report?.filePath.replace(/\\/g, '/');
      const fullPath = baseUrl + normalizedPath;

      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullPath);
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
}