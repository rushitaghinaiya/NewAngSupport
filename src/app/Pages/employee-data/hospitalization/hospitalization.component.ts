import { HospitalizationVM } from '../models/hospitalization';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HospitalizationReports } from '../models/hospitalization';
import { HospitalizationReportVM } from '../models/hospitalization';
import { HospitalizationMedicationVM } from '../models/hospitalization';
import { Report } from '../models/report.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
@Component({
  selector: 'app-hospitalization',
  imports: [FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ],
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
    issuedOn: undefined,
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
  filteredMedicines: any[][] = [];
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
      hospitalizationMedications: [],
      medicineMasters: []
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
          this.filteredMedicines = this.HospitalizationReportVM.hospitalizationMedications.map(() =>
            this.HospitalizationReportVM.medicineMasters
          );
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
            this.addEmptyMedicine();
          }
        },
        error: (err) => {
          console.error('Failed to fetch hospitalization detail:', err);
        }
      });
    }
  }


  saveHospitalization(): void {
    const storedData = localStorage.getItem('userApp');
    let userdata = [];
    if (storedData) {
      userdata = JSON.parse(storedData);
    }
    const supportData = localStorage.getItem('support');
    let support = [];
    if (supportData) {
      support = JSON.parse(supportData);
    }
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
      createdBy: support.fullName,
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

    const Hurl = this.apiUrl + '/api/v1/Hospitalization/AddHospitalization';

    this.http.post<any>(Hurl, hospitalization, {
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
            labName: model.hospitalName ?? '',
            reportId: model.reportId ?? 0,
            updatedAt: 'system',
            updatedOn: this.report?.uploadedOn ?? new Date(),
            uploadedOn: model.createdOn,
            updatedBy: support.fullName ?? '',
            issuedOn: model.issuedOn ?? undefined,
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
          report.reportTypeId = model.reportTypeId;
          report.reportFromId = model.reportFromId;
          report.reportFrom = 'Hospital';
          report.updatedOn = new Date();
          report.updatedBy = support.fullName ?? '';
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
  addEmptyMedicine() {
    debugger;
    this.HospitalizationReportVM?.hospitalizationMedications.push({
      hospitalizationMedicationId: 0,
      medicineId: 0,
      noOfDays: '0',
      medicineName: '',
    });
  }
  filterMedicine(searchText: any, i: number) {
    const term = (searchText || '').toString().toLowerCase();
    this.filteredMedicines[i] = this.HospitalizationReportVM.medicineMasters.filter(med =>
      med.medicineName.toLowerCase().includes(term)
    );
  }

  // Display function
  displayMedicine(medicine: any): string {
    return medicine?.medicineName || '';
  }

  // Returns the selected medicine object based on medicineId
  getSelectedMedicine(index: number): any {
    const medicineId = this.HospitalizationReportVM.hospitalizationMedications[index]?.medicineId;
    return this.HospitalizationReportVM.medicineMasters.find(m => m.medicineId === medicineId) || null;
  }

  // When typing, filter from master list
  onMedicineInputChange(value: string, index: number): void {
    this.filterMedicine(value, index); // You already have this method
  }

  // When selected from dropdown
  selectMedicine(selectedMedicine: any, index: number): void {
    this.HospitalizationReportVM.hospitalizationMedications[index].medicineId = selectedMedicine.medicineId;
  }
}