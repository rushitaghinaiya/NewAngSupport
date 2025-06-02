import { HttpClient } from '@angular/common/http';
import { Component, OnInit,inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  userList: any[] = [];
  reportList: any[] = [];
  private userId: number | null = null;
  totalReportFirst: number = 0;
  totalReportPeer: number = 0;
  totalDistParentFirst: number = 0;
  totalDistParentPeer: number = 0;
  reportIdFirst:number=0;
  reportIdPeer:number=0;

  constructor(private http: HttpClient) {

  }
  ngOnInit(): void {
    
    this.getReportsCount();

  }
  router = inject(Router)
  getReportsCount() {

    const storedData = localStorage.getItem('userApp');
   
    if (storedData) {
      const userData = JSON.parse(storedData);
       this.userId = userData.userId;
    }
    this.http.get("https://localhost:7050/api/v1/Support/GetReportsCount?FirstUserReviewerId=" + this.userId).subscribe((res: any) => {
      this.userList = res.responseData;
      
      console.log(this.userList);
      const result1 = this.userList.find((item: any) =>
        item.header === 'First Verification' &&
        item.question === 'Total no of reports'
      );

      this.totalReportFirst = result1?.answer || null;

      const result2 = this.userList.find((item: any) =>
        item.header === 'First Verification' &&
        item.question === 'Total no of distinct patients'
      );

      this.totalDistParentFirst = result2?.answer || null;

      const result3 = this.userList.find((item: any) =>
        item.header === 'Peer Verification' &&
        item.question === 'Total no of reports'
      );

      this.totalReportPeer = result3?.answer || null;

      const result4 = this.userList.find((item: any) =>
        item.header === 'Peer Verification' &&
        item.question === 'Total no of distinct patients'
      );

      this.totalDistParentPeer = result4?.answer || null;

    })


    this.http.get("https://localhost:7050/api/v1/Support/GetReportId?FirstUserReviewerId=" + this.userId).subscribe((res: any) => {
      
      this.reportList = res.responseData;
      const result1 = this.reportList.find((item: any) =>
        item.question === 'First Verification'
      );

      this.reportIdFirst = Array.isArray(result1?.answer) ? result1.answer[0] : result1?.answer || null;

      const result3 = this.reportList.find((item: any) =>
        item.question === 'Peer Verification'
      );

      this.reportIdPeer = Array.isArray(result3?.answer) ? result3.answer[0] : result3?.answer || null;
      
    })
  }
  showError(message: string): void {
    // Replace with a real toast/snackbar service if available
    alert(message);
  }

  FirstVerification(reportId: number, isFirst: boolean): void {
    
    localStorage.setItem("isFirst",isFirst.toString());
    const hostURL = 'https://localhost:7050/api/v1/'; 
  
    this.http.get<boolean>(`${hostURL}Report/VerifyIfReportExistForVerification?ReportId=${reportId}&IsFirst=${isFirst}`)
      .subscribe({
        next: (exists) => {
          if (exists) {
            
            this.http.get<boolean>(`${hostURL}Report/UpdateFirstVerification?ReportId=${reportId}&FirstReviewUserId=${this.userId}&IsFirstVerification=${isFirst}`)
              .subscribe({
                next: (updated) => {
                  if (updated) {
                    localStorage.setItem("reportId",JSON.stringify(reportId));
                    this.router.navigate(['/report'], {
                      queryParams: { id: reportId, isFirst }
                    });
                  } else {
                    this.showError('Something went wrong!');
                  }
                },
                error: (err) => {
                  alert('Error: ' + err.message);
                }
              });
          } else {
            this.showError('Report already taken for verification.');
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2500);
          }
        },
        error: (err) => {
          alert('Error: ' + err.message);
        }
      });
  }
  
}
