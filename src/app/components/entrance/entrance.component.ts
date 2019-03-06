import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { SnotifyService } from 'ng-snotify';

@Component({
  selector: 'app-entrance',
  templateUrl: './entrance.component.html',
  styleUrls: ['./entrance.component.scss']
})
export class EntranceComponent implements OnInit {

  constructor(private dl: DataloaderService, private route: ActivatedRoute, private Auth: AuthService,
    private notify: SnotifyService, private tn: TokenService, private router: Router,) { }

  public link: string = '';
  public error = null;

  ngOnInit() {
    let sub = this.route.params.subscribe(params => {
      if(params.hasOwnProperty('l')){
        this.link = params['l']; // (+) converts string 'id' to a number
        this.dl.entrance(this.link).subscribe(
          data => this.handleResponse(data),
          //error => this.handleError(error)
          error => this.notify.error(error.error.error, {timeout: 5000})
        );
      }

    });
  }

  
  handleResponse(data) {
    this.tn.handle(data.access_token);
    this.Auth.changeAuthStatus(true);
    this.notify.success('You are logged in!', {timeout: 2000});
    this.router.navigateByUrl('/home');
  }

  handleError(error) {
    this.error = error.error.error;
  }


  

}
