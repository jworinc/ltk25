import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable()
export class BeforeLoginService implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    //return !this.Token.loggedIn();
    if(this.Token.loggedIn()){
  		this.router.navigateByUrl('/home');
  		return false;
  	} else {
  		return true;
  	}
  }
  constructor(private Token: TokenService, private router: Router) { }

}