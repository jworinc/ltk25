import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detail-report',
  templateUrl: './detail-report.component.html',
  styleUrls: ['./detail-report.component.scss']
})
export class DetailReportComponent implements OnInit {

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

    ngOnInit() {

    }

    detailUpdateCallback(data) {
      if(typeof data.result === 'object'){
        this.reports = [];
        for(let i in data.result){
          let r = data.result[i];
          this.reports.push({lesson: r.lesson, activity: r.activity, expected: r.expected, answer: r.answer, hintlevel: r.hintlevel, end: r.end});
        }
        this.report_ready = true;
      }
    };

    refreshReport() {
      let that = this;
      this.current_lesson = 0;
      this.dataloader.getDetail().subscribe(
        data => { that.detailUpdateCallback(data); },
        error => { console.log(error); }
      );
    }

}
