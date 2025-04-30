import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  userList: any[] = [];
  private userId: number | null = null;
  totalReportFirst:number=0;
  totalReportPeer:number=0;
  totalDistParentFirst:number=0;
  totalDistParentPeer:number=0;

  constructor(private http: HttpClient) {

  }
  ngOnInit(): void {
    
   
  }
  
}
