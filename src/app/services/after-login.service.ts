import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable()
export class AfterLoginService implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
  	if(!this.Token.loggedIn()){
  		this.router.navigateByUrl('/login');
  		return false;
  	} else {
  		return true;
  	}
    
  }
  constructor(private Token: TokenService, private router: Router) { }

}