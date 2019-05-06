import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PlaymediaService } from './services/playmedia.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'LTKLessons';

  constructor(
    private el:ElementRef,
    private playmedia: PlaymediaService
  ) { }

  public visible_timer: any = null;

  ngOnInit() {
    this.el.nativeElement.parentNode.querySelector('#app-is-loading-screen').style.display = 'none';
  }

  @HostListener('document:visibilitychange', ['$event'])
  onVisibilityChange(ev:any) {
    if(ev.target.visibilityState === 'hidden'){
      console.log('VisibilityChange event');
      this.playmedia.stop();
    }
    
  }

  @HostListener('window:blur', ['$event'])
  onBlurChange(ev:any) {
    console.log('Blur Change event');
    this.playmedia.stop();
  }

}
