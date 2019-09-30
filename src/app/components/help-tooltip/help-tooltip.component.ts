import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HelpService } from '../../services/help.service';

@Component({
  selector: 'app-help-tooltip',
  templateUrl: './help-tooltip.component.html',
  styleUrls: ['./help-tooltip.component.scss']
})
export class HelpTooltipComponent implements OnInit {

  //@Output() public showhelp = new EventEmitter<boolean>();
  @Input() public pos: number;
  @Input() public selector: string;
  

  public _show: boolean = false;

  constructor(public hs: HelpService) { }

  ngOnInit() {
  }

}
