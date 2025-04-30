import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  toggleForm: boolean = false;
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
    debugger;
    this.http.post("https://localhost:7050/api/v1/support/SupportLogin", this.loginObj).subscribe((res: any) => {
      debugger
      localStorage.setItem("userApp",JSON.stringify(res.responseData));
      localStorage.setItem("token",res.responseData.authenticationModel.token);
      console.log("Token",res.responseData.authenticationModel.token)
      if (res.statusMessage == "success") {
        this.router.navigateByUrl("user-list")
      }
      else {
        alert(res.statusMessage);
      }
    }, (error: any) => {
      debugger;
      const errorBody = error.error;
      console.log("Custom Error Message:", errorBody.statusMessage);
      alert("Error: " + errorBody.statusMessage);
    });
  }
}
