export interface HospitalizationVM {
  hospitalizationId?: number;
  userId: number;
  hospitalName?: string;
  admissionDate?: string;
  dischargeDate?: string;
  doctorName?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  doctorCharge?: number;
  roomCharge?: number;
  medicineCharge?: number;
  reportCharge?: number;
  otherCharge?: number;
  totalCharges?: number;

  hospitalizationMedications: HospitalizationMedicationVM[];
  hospitalizationReports?: HospitalizationReports[];
  xRayMriReports?: HospitalizationReports[];
  dischargeSummaryReports?: HospitalizationReports[];

  createdAt?: string;
  createdBy?: string;
  createdOn?: Date;
}

export interface HospitalizationMedicationVM {
  hospitalizationMedicationId?: number;
  hospitalizationId?: number;
  medicineId?: number;
  medicineName: string;
  noOfDays?: string;
  medicineFoodRelation?: string;
}


export interface HospitalizationReports {
  hospitalizationReportId?: number;
  hospitalizationId?: number;
  reportTypeId?: number;
  filePath?: string;
  fileName?: string;
  frzInd?: boolean;
}

export interface HospitalizationReportVM extends HospitalizationVM {
  labName?: string;
  reportId?: number;
  branchName?: string;
  reportFromId?: number;
  reportTypeId?: number;
  reportFrom?: string;
  patientContactNo?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  reportHeaderData?: ReportHeaderData;
  isFirstOrPeer?: boolean;
  filePath?: string;
  medicineMasters?: MedicineMaster[];
  issuedOn?: string;
}
export interface MedicineMaster {
  medicineId: number;
  medicineName: string;
  description: string;
}

export interface ReportHeaderData {
  reportHeaderId?: number;
  reportId?: number;
  firstReviewer_UserId?: number;
  firstReviewer_FirstName?: string;
  firstReviewer_LastName?: string;
  firstReviewer_Telephone?: string;
  firstReviewer_UpdatedBy?: string;
  firstReviewer_UpdatedAt?: string;
  firstReviewer_UpdatedOn?: Date;
  peerReviewer_UserId?: number;
  peerReviewer_FirstName?: string;
  peerReviewer_LastName?: string;
  peerReviewer_Telephone?: string;
  peerReviewer_UpdatedBy?: string;
  peerReviewer_UpdatedAt?: string;
  peerReviewer_UpdatedOn?: Date;
  frzInd?: boolean;
}


