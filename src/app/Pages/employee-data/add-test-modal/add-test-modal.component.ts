import { Component, Input,Output ,EventEmitter} from '@angular/core';
import { ReportVM } from '../models/report.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-add-test-modal',
  imports: [FormsModule,CommonModule],
  templateUrl: './add-test-modal.component.html',
  styleUrl: './add-test-modal.component.css'
})
export class AddTestModalComponent {

  test: any = {
   userId: 0,
       testId: 0,
       reportId: 0,
       name:'',
       testTypeId: 0,
       testFields: [],
       testNotes:[],
       type: '',
       pageNo: 0,
       notes: ''
  };
  constructor(private sanitizer: DomSanitizer) {}
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
    // handle form submission here
  }

  addRowAfter(index: number) {
    this.test.testFields.push({
      name: '',
      value: '',
      unit: '',
      range: { min: '', operator: '', max: '' },
      severity: ''
    });
  }

  deleteRow(index: number) {
    if (this.test.testFields.length > 1) {
      this.test.testFields.splice(index, 1);
    }
  }
}
