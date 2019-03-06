import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'LTKLessons';

  constructor(
    private el:ElementRef
  ) { }

  ngOnInit() {

  	this.el.nativeElement.parentNode.querySelector('#app-is-loading-screen').style.display = 'none';

  }
}
