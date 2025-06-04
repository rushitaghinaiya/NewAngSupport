import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../../config/constants';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private baseUrl = API_BASE_URL;
  toggleForm: boolean = false;
  support: any[] = [];
  registerObj: any = {
    Password: "",
    ContactNo: "",
    CreatedAt: "Dell",
    FCMToken: "str",
  }

  loginObj: any = {
    Password: "",
    UserName: ""
  }

  http = inject(HttpClient);
  router = inject(Router);

  

  OnLogin() {
    
    this.http.post(`${this.baseUrl}api/v1/support/SupportLogin`, this.loginObj).subscribe((res: any) => {
      debugger
      localStorage.setItem("userApp",JSON.stringify(res.responseData));
      localStorage.setItem("token",res.responseData.authenticationModel.token);
      if (res.statusMessage == "success") {
        this.http.get(`${this.baseUrl}api/v1/Support/GetSupportByUserId?UserId=${res.responseData.userId}`).subscribe((res: any) => {
          debugger;
          if (res.responseData) {
            this.support=res.responseData;
            localStorage.setItem("support",JSON.stringify(res.responseData) );
          }
        });
        this.router.navigateByUrl("user-list")
      }
      else {
        alert(res.statusMessage);
      }
    }, (error: any) => {
      
      const errorBody = error.error;
      console.log("Custom Error Message:", errorBody.statusMessage);
      alert("Error: " + errorBody.statusMessage);
    });
  }
}
