import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-placement-report',
  templateUrl: './placement-report.component.html',
  styleUrls: ['./placement-report.component.scss']
})
export class PlacementReportComponent implements OnInit {

  constructor(
    private dataloader: DataloaderService,
    private el: ElementRef,
    private translation: TranslateService,
  ) { 
    this.placement = {
      wrong_answers: 0,
      total: 0,
      lesson: 0,
      end: '-',
      errors: []
    }
  }

    public _update: boolean;
    public placement: any;

    @Input('update')
    set update(update: boolean) {
      this._update = update;
      this.refreshReport();
    }

  ngOnInit() {
  }

  placementUpdateCallback(data) {
    console.log(data);
    if(typeof data === 'object'){
      
      if(typeof data.wrong_answers !== 'undefined' && typeof data.right_answer !== undefined){
        this.placement = data;
        this.placement.total = parseInt(data.wrong_answers) + parseInt(data.right_answer);
      }

    }
  }

  refreshReport() {
    let that = this;
    this.dataloader.getPlacement().subscribe(
      data => { that.placementUpdateCallback(data); },
      error => { console.log(error); }
    );
  }

}
