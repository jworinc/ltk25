import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-course-expire-msg',
  templateUrl: './course-expire-msg.component.html',
  styleUrls: ['./course-expire-msg.component.scss']
})
export class CourseExpireMsgComponent implements OnInit {

  public note_btn_lable = 'send_request_to_orgadmin';

  constructor(private dl: DataloaderService, private translate: TranslateService) { }

  ngOnInit() {
  }

  sendNotification() {
    let that = this;
    that.note_btn_lable = '...';
    this.dl.sendCourseExpiredNotificationEmail().then(()=>{
      that.note_btn_lable = 'request_sent_to_orgadmin';
    });
  }

}
