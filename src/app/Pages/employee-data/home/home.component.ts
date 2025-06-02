import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [ RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
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
   

  }
  router = inject(Router)

  logout() {
    localStorage.removeItem("userApp");
    this.router.navigateByUrl("/login")

  }
  
  
}
