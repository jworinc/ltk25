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
      errors: [],
      results: [],
      details: []
    }
  }

    public _update: boolean;
    public placement: any;
    public tests: any;
    public cdetails: any;
    public show_test_details: boolean;
    public report_pcm_ready: boolean = false;
    public report_tst_ready: boolean = false;

    @Input('update')
    set update(update: boolean) {
      this._update = update;
      this.report_tst_ready = false;
      this.report_pcm_ready = false;
      this.refreshReport();
    }

  ngOnInit() {
  }

  placementUpdateCallback(data) {
    console.log(data);
    if(typeof data === 'object' && typeof data.placement !== 'undefined' && 
    typeof data.placement.results !== 'undefined' && typeof data.placement.errors !== 'undefined'){
      this.placement = data.placement;
      if(typeof data.placement.wrong_answers !== 'undefined' && 
          typeof data.placement.right_answer !== 'undefined' && 
          data.placement.wrong_answers !== null &&
          data.placement.right_answer !== null){
        
        this.placement.total = parseInt(data.placement.wrong_answers) + parseInt(data.placement.right_answer);
      } else this.placement.total = 0;

      //  Create details list for new placement test
      this.placement.details = [];
      if(this.placement.results.length > 0){
        for(let i in this.placement.results){
          let br = this.placement.results[i];
          for(let n in br){
            let t = br[n];
            if(typeof t.details !== 'undefined' && t.details.length > 0){
              for(let k in t.details){
                this.placement.details.push(t.details[k]);
              }
            }
          }
        }
      }

      this.tests = data.testing;
      
    }
    this.report_tst_ready = true;
    this.report_pcm_ready = true;
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

    if(this.cdetails.length === 0){
      this.cdetails.push({answer: "-", expected: "-", isCorrect: false});
    }

    this.show_test_details = true;

  }
  
  closeDetails() {
    this.show_test_details = false;
  }

}
