import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';
import * as $ from 'jquery';

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
    public tests: any;
    public cdetails: any;
    public show_test_details: boolean;

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
      
      if(typeof data.placement.wrong_answers !== 'undefined' && typeof data.placement.right_answer !== undefined){
        this.placement = data.placement;
        this.placement.total = parseInt(data.placement.wrong_answers) + parseInt(data.placement.right_answer);
      }

      this.tests = data.testing;

    }
  }

  refreshReport() {
    let that = this;
    this.dataloader.getPlacement().subscribe(
      data => { that.placementUpdateCallback(data); },
      error => { console.log(error); }
    );
  }

  getValue(r) {
    if(r.presented > 0)
      return Math.round(((r.presented-r.wrong)/r.presented)*100);
    else return 0;
  }

  showTestDetails(dt) {
    console.log(dt);

    this.cdetails = [];

    //  Filter errors from details list
    for(let i in dt){
      let d = dt[i];
      if(d && !d.isCorrect) {
        this.cdetails.push(d);
      }
    }

    this.show_test_details = true;

  }
  
  closeDetails() {
    this.show_test_details = false;
  }

}
