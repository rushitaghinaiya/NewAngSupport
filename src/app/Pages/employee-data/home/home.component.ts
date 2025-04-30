import { Component, inject, Inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  userList: any[] = [];
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

  logout() {
    localStorage.removeItem("userApp");
    this.router.navigateByUrl("/login")

  }
  getReportsCount() {

    const storedData = localStorage.getItem('userApp');
    var userId=0;
    if (storedData) {
      const userData = JSON.parse(storedData);
       userId = userData.userId;
    }
    this.http.get("https://localhost:7050/api/v1/Support/GetReportsCount?FirstUserReviewerId=" + userId).subscribe((res: any) => {
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


    this.http.get("https://localhost:7050/api/v1/Support/GetReportId?FirstUserReviewerId=" + userId).subscribe((res: any) => {
      this.userList = res.responseData;
      debugger;
      console.log(this.userList);
      const result1 = this.userList.find((item: any) =>
        item.header === 'First Verification'
      );

      this.reportIdFirst = Array.isArray(result1?.answer) ? result1.answer[0] : result1?.answer || null;

      const result3 = this.userList.find((item: any) =>
        item.header === 'Peer Verification'
      );

      this.reportIdPeer = Array.isArray(result3?.answer) ? result3.answer[0] : result3?.answer || null;

      
    })
  }
}
