import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable()
export class BeforeLoginService implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    let pth = this.lcn.path().split('/');
    let p = '';
    if(pth.length > 1) p = pth[1];
<<<<<<< HEAD
    if(this.Token.loggedIn() && p !== 'entrance' && p !== 'demo'){
  		this.router.navigateByUrl('/home');
=======
    let r = route.routeConfig.path.split('/')[0];
    if(this.Token.loggedIn() && r !== 'entrance'){
      
      if(r === 'pcm' || r === 'test' || r === 'testing' || (r === 'demo' && p === 'demo')) {
        return true;
      } else this.router.navigateByUrl('/test');
>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results
  		return false;
  	} else {
      this.Auth.changeAuthStatus(false);
      this.Token.remove();
  		return true;
  	}
  }
  constructor(private Token: TokenService, private router: Router, private lcn: Location, private Auth: AuthService) { }

}