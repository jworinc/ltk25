import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-progress-report',
  templateUrl: './progress-report.component.html',
  styleUrls: ['./progress-report.component.scss']
})
export class ProgressReportComponent implements OnInit {

  constructor(
    private dataloader: DataloaderService,
    private el: ElementRef,
    private translation: TranslateService,
  ) { }

    public _update: boolean;
    public report_ready: boolean = false;

    @Input('update')
    set update(update: boolean) {
      this._update = update;
      this.report_ready = false;
      this.refreshReport();
    }

    public current_lesson = 0;
    public lessons = [];
    public reports = [];
    public total: any;

    ngOnInit() {
      this.total = {timeson: 0, duration: 0};
    }

    calcTotal(reports) {
        let $t = {timeson: 0, duration: '0'};
        let d = 0;
        for(let i in reports) {
          let r = reports[i];
          $t.timeson += r.timeson;
          d += r.duration;
        }
        $t.duration = this.getDurationString(d);
        return $t;
    }

    //  Format duration string with hours and minutes according to duration in minutes
    getDurationString(d) {
        
        let hours = Math.floor(d/60);
        let mins = Math.floor(d%60);
        let out = '';
        if(hours > 0) out += hours + ' ' + this.translation.instant('time_h')+' ';
        out += mins + ' ' + this.translation.instant('time_mins');
        return out;
        
    }

    progressUpdateCallback(data) {
        if(typeof data.result === 'object'){
          this.reports = [];
          for(let i in data.result){
            this.reports.push({lesson: data.result[i].alias, end: data.result[i].end, timeson: data.result[i].timeson, duration: this.getDurationString(data.result[i].duration)});
          }
          this.total = this.calcTotal(data.result);
          this.report_ready = true;
        }
    };

    refreshReport() {
      let that = this;
      this.current_lesson = 0;
      this.dataloader.getProgress().subscribe(
        data => { that.progressUpdateCallback(data); },
        error => { console.log(error); }
      );
    }




}
