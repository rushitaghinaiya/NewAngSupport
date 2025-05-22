import { HospitalizationVM } from '../models/hospitalization';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Report } from '../models/report.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PrescriptionReportVM } from '../models/prescription';
import { PrescriptionVM } from '../models/prescription';
import { PrescribedMedication } from '../models/prescription';

@Component({
  selector: 'app-prescription',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './prescription.component.html',
  styleUrl: './prescription.component.css'
})
export class PrescriptionComponent {
  pdfUrl!: SafeResourceUrl;
  apiUrl = "https://localhost:7050";
  PrescriptionReportVM: PrescriptionReportVM = {
    patientName: '',
    patientContactNo: '',
    patientAge: '',
    patientGender: '',
    branchName: '',
    labName: '',
    filePath: '',
    doctorEmail: '',
    reportId: 0,
    userId: 0,
    reportFromId: 0,
    doctorName: '',
    diagnosis: '',
    notes: '',
    prescriptionDate: new Date,
    prescriptionId: 0,
    prescribedMedications: [{
      prescriptionId: 0,
      medicineId: 0,
      noOfDays: '',
      medicineName: ''
    }],
    prescribedMedicines: [],
    medicineMasters: []
  };
  PrescriptionVM: PrescriptionVM = {
    doctorName: '',
    userId: 0,
    doctorEmail: '',
    clinicalNotes: '',
    notes: '',
    diagnosis: '',
    medicineMasters: []
  };
  report: Report | null = null;

  router = inject(Router);
  constructor(private route: ActivatedRoute, private http: HttpClient, private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      debugger;
      if (params['report']) {
        this.report = JSON.parse(params['report']);
        console.log('Report Data:', this.report);
        this.getPrescription(JSON.parse(params['report']));
      }

    });
  }

  getPrescription(report: Report): void {
    debugger;
    const model: PrescriptionReportVM = {
      reportId: report.reportId,
      patientName: report.patientName,
      patientAge: report.patientAge,
      patientGender: report.patientGender,
      patientContactNo: report.patientContactNo,
      labName: report.labName,
      branchName: report.branchName,
      filePath: report.filePath.replace(/\\/g, '/'),
      userId: 0,
      reportFromId: 0,
      doctorName: '',
      doctorEmail: '',
      diagnosis: '',
      notes: '',
      prescriptionDate: new Date,
      prescriptionId: report.reportFromId,
      // ...add other fields if needed
      prescribedMedicines: [],
      prescribedMedications: [],
      medicineMasters: []
    };

    const baseUrl = 'https://staging.themedibank.in/patientfiles/';
    const normalizedPath = report.filePath?.replace(/\\/g, '/') ?? '';
    const fullPath = baseUrl + normalizedPath;

    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullPath);
    if (report) {
      const url = `${this.apiUrl}/api/v1/Prescription/GetPrescriptionDetail/${report.userId}/${report.reportFromId}`;
      this.http.get<any>(url).subscribe({
        next: (res) => {
          debugger;
          if (res.statusMessage === 'success') {
            Object.assign(model, res.responseData); // Copy matching properties
            model.reportId = report.reportId;
            model.reportFromId = report.reportFromId;
            model.patientName = report.patientName;
            model.patientAge = report.patientAge;
            model.patientGender = report.patientGender;
            model.patientContactNo = report.patientContactNo;
            model.labName = report.labName;
            model.branchName = report.branchName;
            model.filePath = fullPath;
            // Do something with model like assign to a form or display in template
            this.PrescriptionReportVM = model;
            this.getMedicine();
            if (this.PrescriptionReportVM.prescribedMedications.length == 0) {
              this.addEmptyMedicine();
            }
          }
        },
        error: (err) => {
          console.error(err); // log the error to see what went wrong
        }
      });


    } else {
      this.PrescriptionReportVM = model; // In case report is null
    }


  }
  getMedicine() {
    this.http.get<any>(`https://localhost:7050/api/v1/Hospitalization/GetMedicineMaster`).subscribe({
      next: (response: any) => {
        debugger;
        if (response?.statusMessage?.toLowerCase() === 'success' && response.responseData) {
          this.PrescriptionReportVM.medicineMasters = response.responseData;
        }
      },
      error: (error) => {
        console.error('Error fetching medicine masters:', error);
      }
    });
  }
  removeMedication(index: number): void {
    this.PrescriptionReportVM.prescribedMedications.splice(index, 1);
  }
  addMedication(index?: number): void {
    const current = this.PrescriptionReportVM.prescribedMedications[index ?? 0];
    const newMedication = {
      prescriptionId: current.prescriptionId ?? 0,
      medicineId: current.medicineId ?? 0,
      noOfDays: '',
      medicineName: current.medicineName
    };

    // Insert new row right after the current one
    if (index !== undefined) {
      this.PrescriptionReportVM.prescribedMedications.splice(index + 1, 0, newMedication);
    } else {
      this.PrescriptionReportVM.prescribedMedications.push(newMedication);
    }
  }
  addEmptyMedicine() {
    this.PrescriptionReportVM.prescribedMedications.push({
      medicineId: 0,
      medicineName: '',
      noOfDays: '',
      prescriptionId: this.PrescriptionReportVM.reportFromId
    });
  }

  SavePrescribeMedicine(): void {
    debugger;
    const storedData = localStorage.getItem('userApp');
    let userdata = [];
    if (storedData) {
      userdata = JSON.parse(storedData);
    }
    const model = { ...this.PrescriptionReportVM };
    // Basic validation
    if (
      !model.doctorName ||
      !model.notes ||
      !model.diagnosis
    ) {
      alert('All * mark fields are mandatory');
      return;
    }
    const pvm =
      Object.assign(this.PrescriptionVM, model);

    const Hurl = this.apiUrl + '/api/v1/Prescription/SavePrescription';

    this.http.post<any>(Hurl, this.PrescriptionVM, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe({
      next: (res) => {
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
            updatedOn: this.report?.uploadedOn ?? new Date(),
            uploadedOn: model.createdOn,
            updatedBy: userdata.userName ?? '',
            issuedOn: model.issuedOn ?? '',
            userId: model.userId,
            isVerified: true,
            verifiedOn: new Date(),
            reportHeaderData: {},
            filePath: this.report?.filePath ?? '',
            tests: []
          }
          let isFirst = localStorage.getItem('isFirst')?.toString();
          if (isFirst === 'true') {
            report.reportHeaderData.firstReviewer_FirstName = model.patientName;
            report.reportHeaderData.firstReviewer_Telephone = userdata.contactNo;
            report.reportHeaderData.firstReviewer_UpdatedOn = new Date();
            report.reportHeaderData.firstReviewer_UpdatedAt = 'System';
            report.reportHeaderData.firstReviewer_UpdatedBy = userdata.userName;
            report.reportHeaderData.firstReviewer_UserId = Number(userdata?.userId);
            report.reportHeaderData.reportId = model.reportId;
          }
          else {
            report.reportHeaderData.peerReviewer_FirstName = model.patientName;
            report.reportHeaderData.peerReviewer_Telephone = model.patientContactNo;
            report.reportHeaderData.peerReviewer_UpdatedOn = new Date();
            report.reportHeaderData.peerReviewer_UpdatedAt = 'System';
            report.reportHeaderData.peerReviewer_UpdatedBy = userdata.userName;
            report.reportHeaderData.peerReviewer_UserId = Number(userdata?.userId);

          }
          report.reportTypeId = model.prescriptionId;
          report.reportFromId = model.reportFromId;
          report.reportFrom = 'prescription';
          report.updatedOn = new Date();
          report.updatedBy = userdata.userName ?? '';
          report.updatedAt = 'system';
          report.isFirstOrPeer = isFirst === 'true';
          const url = this.apiUrl + '/api/v1/Report/UpdateReport';

          this.http.post<any>(url, report, {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            })
          }).subscribe({
            next: (res) => {
              if (res.statusMessage === 'success') {
                const updateurl = this.apiUrl + "/api/v1/Report/UpdateFirstVerification?Reportid=" + report.reportId + "&FirstReviewUserId=" + Number(userdata?.userId) + "&IsFirstVerification=" + report.isFirstOrPeer;

                this.http.get<any>(updateurl).subscribe({
                  next: (res) => {
                    if (res.statusMessage === 'success') {
                      alert('Hospitalization Saved Successfully');
                      this.router.navigateByUrl("user-list");
                    }
                  },
                  error: (err) => {
                    console.error(err); // log the error to see what went wrong
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
}

