import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-test-result-item',
  templateUrl: './test-result-item.component.html',
  styleUrls: ['./test-result-item.component.scss']
})
export class TestResultItemComponent implements OnInit {

  constructor() { }

  public _value: any;

  @Input() header: string;
  @Input('value')
  set value(value: number) {
     this._value = value;
     this.updateBar();
  }
  @Input() units: string;

  public bar_style: any = null;

  ngOnInit() {
    this.updateBar();
  }

  updateBar() {
    this.bar_style = {
      height: (this._value + 2) + '%'
    }
  }

}
