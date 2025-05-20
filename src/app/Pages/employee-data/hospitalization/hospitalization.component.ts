import { HospitalizationVM } from '../models/hospitalization';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HospitalizationReports } from '../models/hospitalization';
import { HospitalizationReportVM } from '../models/hospitalization';
import { HospitalizationMedicationVM } from '../models/hospitalization';
import { Report } from '../models/report.model';
import { CommonModule } from '@angular/common';
import { AddTestModalComponent } from '../add-test-modal/add-test-modal.component';
import { AddNewTestModalComponent } from '../add-new-test-modal/add-new-test-modal.component'
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-hospitalization',
  imports: [FormsModule, CommonModule],
  templateUrl: './hospitalization.component.html',
  styleUrl: './hospitalization.component.css'
})
export class HospitalizationComponent {
  pdfUrl!: SafeResourceUrl;
  hospitalizationMedicaine: HospitalizationMedicationVM | null = null;
  hospitalizationVM: HospitalizationVM | null = null;
  report: Report | null = null;
  HospitalizationReportVM: HospitalizationReportVM = {
    reportId: 0,
    reportFromId: 0,
    reportTypeId: 0,
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientContactNo: '',
    labName: '',
    branchName: '',
    filePath: '',
    userId: 0,
    medicineMasters: [],
    // Add default values for all required fields in HospitalizationReportVM
    reportFrom: '',
    isFirstOrPeer: false,
    hospitalizationId: 0,
    hospitalName: '',
    admissionDate: new Date,
    dischargeDate: new Date,
    doctorName: '',
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',

    hospitalizationMedications: [],
    hospitalizationReports: [],
    xRayMriReports: [],
    dischargeSummaryReports: [],
    issuedOn: '',
    reportHeaderData: {
      reportHeaderId: 0,
      reportId: 0,
      firstReviewer_UserId: 0,
      firstReviewer_FirstName: '',
      firstReviewer_LastName: '',
      firstReviewer_Telephone: '',
      firstReviewer_UpdatedBy: '',
      firstReviewer_UpdatedAt: '',
      firstReviewer_UpdatedOn: new Date(),
      peerReviewer_UserId: 0,
      peerReviewer_FirstName: '',
      peerReviewer_LastName: '',
      peerReviewer_Telephone: '',
      peerReviewer_UpdatedBy: '',
      peerReviewer_UpdatedAt: '',
      peerReviewer_UpdatedOn: new Date(),
      frzInd: false
    }
  };
  apiUrl = "https://localhost:7050";
  router = inject(Router);
  constructor(private route: ActivatedRoute, private http: HttpClient, private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      debugger;
      if (params['report']) {
        this.report = JSON.parse(params['report']);
        console.log('Report Data:', this.report);
        this.loadHospitalizationData(JSON.parse(params['report']));
      }

    });
  }


  loadHospitalizationData(report: Report): void {
    debugger;
    this.HospitalizationReportVM = {
      reportId: report.reportId,
      reportFromId: report.reportFromId,
      reportTypeId: report.reportTypeId,
      patientName: report.patientName,
      patientAge: report.patientAge,
      patientGender: report.patientGender,
      patientContactNo: report.patientContactNo,
      labName: report.labName,
      branchName: report.branchName,
      filePath: report.filePath,
      userId: report.userId,
      issuedOn: report.issuedOn,
      hospitalizationMedications: []
    };
    const baseUrl = 'https://staging.themedibank.in/patientfiles/';
    const normalizedPath = report.filePath?.replace(/\\/g, '/') ?? '';
    const fullPath = baseUrl + normalizedPath;

    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullPath);
    this.http.get<any>(`https://localhost:7050/api/v1/Hospitalization/GetMedicineMaster`).subscribe({
      next: (response: any) => {
        debugger;
        if (response?.statusMessage?.toLowerCase() === 'success' && response.responseData) {
          this.HospitalizationReportVM.medicineMasters = response.responseData;
        }
      },
      error: (error) => {
        console.error('Error fetching medicine masters:', error);
      }
    });

    if (report.userId && report.reportFromId) {
      const url = `${this.apiUrl}/api/v1/Hospitalization/GetHospitalizationDetail/${report.userId}/${report.reportFromId}`;
      this.http.get<any>(url).subscribe({
        next: (res) => {
          debugger;
          if (res?.statusMessage?.toLowerCase() === 'success' && res.responseData) {
            const hospitalization = res.responseData;

            // Merge hospitalization fields into hospitalizationReportVM
            this.HospitalizationReportVM = {
              ...this.HospitalizationReportVM,
              ...hospitalization // This will add any additional properties from the response
            };
          }
        },
        error: (err) => {
          console.error('Failed to fetch hospitalization detail:', err);
        }
      });
    }
  }


  saveHospitalization(): void {
    debugger;
    const model = { ...this.HospitalizationReportVM };
    // Basic validation
    if (
      !model.hospitalName ||
      !model.doctorName ||
      !model.chiefComplaint ||
      !model.diagnosis
    ) {
      alert('All * mark fields are mandatory');
      return;
    }
    let hospitalization: HospitalizationVM = {
      admissionDate: model.admissionDate,
      dischargeDate: model.dischargeDate,
      createdAt: 'system',
      createdOn: new Date(),
      createdBy: 'rghinaiya',
      hospitalName: model.hospitalName,
      doctorName: model.doctorName,
      chiefComplaint: model.chiefComplaint,
      diagnosis: model.diagnosis,
      treatment: model.treatment,
      doctorCharge: model.doctorCharge,
      roomCharge: model.roomCharge,
      medicineCharge: model.medicineCharge,
      otherCharge: model.otherCharge,
      totalCharges: model.totalCharges,
      userId: this.report?.userId ?? 0,
      hospitalizationId: model.hospitalizationId,
      hospitalizationMedications: model.hospitalizationMedications,
      dischargeSummaryReports: []
    }


    let hospitalizationReport: HospitalizationReports = {
      filePath: this.report?.filePath ?? ''
    };
    hospitalization.dischargeSummaryReports?.push(hospitalizationReport);
    console.log(JSON.stringify(hospitalization));
    const Hurl = this.apiUrl + '/api/v1/Hospitalization/AddHospitalization';

    this.http.post<any>(Hurl, hospitalization, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe({
      next: (res) => {
        debugger;
        if (res.statusMessage === 'success') {
          let hospitalId = res.responseData;
          let report: Report = {
            patientName: model.patientName ?? '',
            patientContactNo: model.patientContactNo ?? '',
            patientAge: model.patientAge ?? '',
            branchName: model.branchName ?? '',
            labName: model.labName ?? '',
            reportId: model.reportId ?? 0,
            updatedAt: 'system',
            updatedOn: new Date(),
            updatedBy: localStorage.getItem('UserName')?.toString() ?? '',
            issuedOn: model.issuedOn ?? '',
            userId: model.userId,
            isVerified: true,
            verifiedOn: new Date().toString() ?? '',
            reportHeaderData: {},
            filePath: model.filePath ?? '',
            tests: []
          }
          let isFirst = localStorage.getItem('isFirst')?.toString();
          if (isFirst === 'true') {
            report.reportHeaderData.firstReviewer_FirstName = model.patientName;
            report.reportHeaderData.firstReviewer_Telephone = model.patientContactNo;
            report.reportHeaderData.firstReviewer_UpdatedOn = new Date();
            report.reportHeaderData.firstReviewer_UpdatedAt = 'System';
            report.reportHeaderData.firstReviewer_UpdatedBy = localStorage.getItem('UserName')?.toString();
            report.reportHeaderData.firstReviewer_UserId = Number(localStorage.getItem('UserId'));
            report.reportHeaderData.reportId = model.reportId;
          }
          else {
            report.reportHeaderData.peerReviewer_FirstName = model.patientName;
            report.reportHeaderData.peerReviewer_Telephone = model.patientContactNo;
            report.reportHeaderData.peerReviewer_UpdatedOn = new Date();
            report.reportHeaderData.peerReviewer_UpdatedAt = 'System';
            report.reportHeaderData.peerReviewer_UpdatedBy = localStorage.getItem('UserName')?.toString();
            report.reportHeaderData.peerReviewer_UserId = Number(localStorage.getItem('UserId'));

          }
          report.reportTypeId = model.reportTypeId;
          report.reportFromId = model.reportFromId;
          report.reportFrom = 'Hospital';
          report.updatedOn = new Date();
          report.updatedBy = localStorage.getItem('UserName')?.toString() ?? '';
          report.updatedAt = 'system';
          report.isFirstOrPeer = isFirst === 'true';

          const url = this.apiUrl + '/api/v1/Report/UpdateReport';

          this.http.post<any>(url,report).subscribe({
            next: (res) => {
              if (res.statusMessage === 'success') {
                const updateurl = this.apiUrl + "/api/v1/Report/UpdateFirstVerification?Reportid=" + report.reportId + "&FirstReviewUserId=" + Number(localStorage.getItem('UserId')) + "&IsFirstVerification=" + report.isFirstOrPeer;

                this.http.get<any>(url).subscribe({
                  next: (res) => {
                    if (res === 'success') {
                      alert('Done');
                    }
                  }
                });
              }
            }
          });
          // alert('Record saved Successfully');
          // setTimeout(() => {
          //   this.router.navigate(['/dashboard']);
          // }, 2000);
        } else {
          alert('Hospitalization record Not added, please try again');
        }
      },
      error: () => {
        alert('Hospitalization record not added, please try again');
      }
    });
  }
  removeMedication(index: number): void {
    this.HospitalizationReportVM.hospitalizationMedications.splice(index, 1);
  }
  addMedication(index?: number): void {
    const current = this.HospitalizationReportVM.hospitalizationMedications[index ?? 0];
    debugger;
    const newMedication = {
      hospitalizationId: current.hospitalizationId,
      medicineId: current.medicineId,
      noOfDays: '',
      medicineName: current.medicineName
    };

    // Insert new row right after the current one
    if (index !== undefined) {
      this.HospitalizationReportVM.hospitalizationMedications.splice(index + 1, 0, newMedication);
    } else {
      this.HospitalizationReportVM.hospitalizationMedications.push(newMedication);
    }
  }
}