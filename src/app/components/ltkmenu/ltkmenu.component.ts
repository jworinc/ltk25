import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ltkmenu',
  templateUrl: './ltkmenu.component.html',
  styleUrls: ['./ltkmenu.component.scss']
})
export class LtkmenuComponent implements OnInit {

  public _show: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  @Input('show')
  set show(show: boolean) {
     this._show = show;
     
  }

}
