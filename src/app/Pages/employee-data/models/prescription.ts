import { MedicineMaster, ReportHeaderData } from "./hospitalization";

export interface PrescriptionVM extends CommonField{
  reportType?: string;
  userId: number;
  prescriptionId?: number;
  prescriptionDate?: Date; // Optional like DateTime?
  doctorName: string;
  doctorEmail?: string;
  diagnosis?: string;
  notes?: string;
  clinicalNotes?: string;
  medicineFoodRelation?: string;
  prescribedMedicines: PrescribedMedicineVM[];
  medicineMasters:MedicineMaster[];
}
export interface PrescribedMedicineVM {
  prescribedMedicationId: number;
  medicineId: number;
  noOfDays: string;
  medicineFoodRelationId?: number;
  medicineName: string;
  medicineFoodRelation?: string;
  prescriptionDate: Date;
  doctorName?: string;
}
export interface Prescription extends CommonField{
  prescriptionId: number;
  userId: number;
  prescriptionDate: Date;
  doctorName: string;
  doctorEmail: string;
  diagnosis: string;
  notes: string;
  filePath: string;
  frzInd: boolean;
  reportId?: number; // Nullable in C#
  medicineFoodRelation: string;
}
export interface PrescribedMedication extends CommonField {
  prescribedMedicationId?: number;
  prescriptionId?: number;
  medicineId: number;
  noOfDays: string;
  medicineFoodRelationId?: number;
  medicineFoodRelation?: string;
  medicineName: string;
  frzInd?: boolean;
}
export interface CommonField {
  createdOn?: Date;
  createdBy?: string;
  createdAt?: string;
  updatedOn?: Date;
  updatedBy?: string;
  updatedAt?: string;
}
export interface PrescriptionReportVM extends PrescriptionVM {
  labName: string;
  reportId: number;
  branchName: string;
  reportFromId?: number;
  reportFrom?: string;
  patientContactNo: string;
  patientName: string;
  patientAge: string;
  patientGender?: string;
  reportHeaderData?: ReportHeaderData;
  prescribedMedications: PrescribedMedication[];
  isFirstOrPeer?: boolean;
  filePath: string;
   issuedOn?: string;
}