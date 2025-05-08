export interface TestFieldRange {
    Value1: string;
    Value2: string;
    operator: string;
    Description: string;
  }
  
  export interface TestField {
    testFieldId: number;
    testId: number;
    name: string;
    value: string;
    testValue: number;
    unit: string;
    severity: string;
    testFieldRanges: TestFieldRange[];
    range:Range;
  }
  
  export interface Test {
    userId: number;
    testId: number;
    reportId: number;
    name: string;
    testTypeId: number;
    testFields: TestField[];
    testNotes:TestNote[];
    type: string;
    pageNo: number;
    notes: string;
  }
  
  export interface Report {
    reportId: number;
    userId: number;
    reportTypeId: number;
    uploadedOn: string;
    fileName: string;
    filePath: string;
    isValidated: boolean;
    validatedOn: string;
    isVerified: boolean;
    verifiedOn: string;
    frzInd: number;
    labName: string;
    isHiddenFromDoctor: boolean;
    branchName: string;
    noOfPages: number;
    isExists: number;
    patientContactNo: string;
    patientName: string;
    patientAge: string;
    patientGender: string;
    tests: Test[];
    verificationStatus: string;
    doctorName: string;
    issuedOn: string;
    reportType: string;
    selectedTestId: number;
  }
  export class TestNote {
    testNoteId: number = 0;
    testId: number = 0;
    testFieldId: number = 0;
  
    value: string = '';
    ocrTestFieldLine: string = '';
    lineNo: number = 0;
  
    frzInd: boolean = false;
}

export interface ReportVM
{
  VerifiedReports:Report[];
  UnverifiedReports:Report[];
  Report:Report;
  Test:Test;
  TestTypes:TestType[];
  BloodReportTypes:ReportType[];
  OtherReason:string;
  
}

export class TestType {
  TestTypeId!: number;
  Name: string = '';
  FrzInd!: boolean;
  SerialNo!: number;
}
export class ReportType {
  ReportTypeId!: number;
  Name: string = '';
  FrzInd!: boolean;
  SerialNo!: number;
}

export interface Range {
    min: string;
    max: string;
    operator: string;
}