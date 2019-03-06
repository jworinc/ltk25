import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss']
})
export class TopnavComponent implements OnInit {
  public loggedIn: boolean;
  constructor(
  	private Auth: AuthService,
  	private router: Router,
  	private Token: TokenService,
  ) { }

  ngOnInit() {
  	this.Auth.authStatus.subscribe(value => this.loggedIn = value);
  }

  logout(event: MouseEvent){
  	event.preventDefault();
  	this.Auth.changeAuthStatus(false);
    this.router.navigateByUrl('/login');
    this.Token.remove();
  }

}
