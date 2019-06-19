import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
 
@Injectable()
export class RequestInterceptor implements HttpInterceptor {
 
  constructor(private Auth: AuthService, private router: Router, private Token: TokenService) {

  }

  private noaccess_status_sent: boolean = false;
 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let r = request;
    let rl = /login/ig;
    if(rl.test(r.url)){
      this.noaccess_status_sent = false;
    }

    return next.handle(request).do((event: HttpEvent<any>) => {}, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        //console.log('Error catched by interceptor');
        //console.log(err);
        if(err.status === 403 && !this.noaccess_status_sent){
          this.noaccess_status_sent = true;
          alert('Sorry, but you have no access to the app, please contact your administrator!');
          this.Auth.changeAuthStatus(false);
          this.router.navigateByUrl('/login');
          this.Token.remove();
        }
        if(err.status === 402 && !this.noaccess_status_sent){
          this.noaccess_status_sent = true;
          alert('You don\'t meet any membership plan or your usage period is expired!');
          this.Auth.changeAuthStatus(false);
          this.router.navigateByUrl('/login');
          this.Token.remove();
        }
      }
    });
  }
}