import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-related-login',
  templateUrl: './related-login.component.html',
  styleUrls: ['./related-login.component.scss']
})
export class RelatedLoginComponent implements OnInit {

  @Input() relaccounts: any[] = [];
  @Output() closerel = new EventEmitter<any>();
  public loading_flag: boolean = false;

  constructor(private dl: DataloaderService,
              private tn: TokenService,
              private router: Router,
              private Auth: AuthService) { }

  ngOnInit() {
  }

  relLogin(email) {
    let that = this;
    this.dl.relatedLogin({email: email}).subscribe(
      data => this.handleResponse(data),
      //error => this.handleError(error)
      error => {
        alert(error.error.error);
        console.log(error);
        that.loading_flag = false;
      }
    );
    this.loading_flag = true;
  }

  handleResponse(data) {

    //  Check if we received expired link message
    if(typeof data.expired !== 'undefined' && data.expired){
      console.log('Link expired');
      console.log(data);
      alert('Link expired');
      return;
    }

    this.tn.handle(data.access_token);
    this.Auth.changeAuthStatus(true);
    //this.router.navigateByUrl('/home');
    this.router.navigateByUrl('/reports', {skipLocationChange: true})
      .then(() => this.router.navigate(['/home']));
      this.loading_flag = false;
  }

  close() {
    this.closerel.emit();
  }


}
