import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-summary-report',
  templateUrl: './summary-report.component.html',
  styleUrls: ['./summary-report.component.scss']
})
export class SummaryReportComponent implements OnInit {

  constructor(
    private dataloader: DataloaderService,
    private el: ElementRef,
    private translation: TranslateService,
  ) { }

  	public _update: boolean;
    public current_lesson = 0;
    public lessons = [];
    public reports = [];

    @Input('update')
    set update(update: boolean) {
    	this._update = update;
      this.refreshReport();
    }

    ngOnInit() {
    }


    // function to calculate difference between date time
    timeDiffBtwTwoDate(val1, val2) {
      let startDate = Date.parse(val2);
      let endDate = Date.parse(val1);
      let milisecondsDiff: any;
      milisecondsDiff = startDate - endDate;
      return Math.floor(milisecondsDiff/(1000*60*60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff/(1000*60))%60).toLocaleString(undefined, {minimumIntegerDigits: 2})  + ":" + (Math.floor(milisecondsDiff/1000)%60).toLocaleString(undefined, {minimumIntegerDigits: 2}) ;
    }

    summaryUpdateCallback(data) {
      if(typeof data.result === 'object'){
        this.reports = [];
        for(let i in data.result){
          let r = data.result[i];
          let complete = "-";
          if(typeof r.complete !== 'undefined' && r.complete !== 'ND') complete = r.complete + '%';
          this.reports.push({lesson: r.lesson, command: r.command, start: r.start, last: r.last, timeson: r.timeson, time: r.time, perf: r.perf, complete: complete});
        }
        
      }
    };


    refreshReport() {
      let that = this;
      this.current_lesson = 0;
      this.dataloader.getSummary().subscribe(
        data => { that.summaryUpdateCallback(data); },
        error => { console.log(error); }
      );
    }


}
