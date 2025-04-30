import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  debugger;
 const token= localStorage.getItem("token");
 const newReq=req.clone({
  setHeaders:{
    AuthoriZation:`Bearer ${token}`
  }
 })
  return next(newReq);
};
