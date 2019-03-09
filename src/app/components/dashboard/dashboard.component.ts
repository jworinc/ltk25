import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { SnotifyService } from 'ng-snotify';
import { TranslateService } from '@ngx-translate/core';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public student = {
  	name: 'Admin',
    lu: 0,
  	sid_message: 'Message'
  }

  public lessons = [];
  //  Lessons sorted by breaks
  public break_1 = [];
  public break_2 = [];
  public break_3 = [];
  public break_4 = [];
  public break_5 = [];

  //  Transformed breaks to columns according to screen width
  public break_to_display_1 = {col_1: [], col_2: [], col_3: [], col_4: [], col_5: [], col_6: []};
  public break_to_display_2 = {col_1: [], col_2: [], col_3: [], col_4: [], col_5: [], col_6: []};
  public break_to_display_3 = {col_1: [], col_2: [], col_3: [], col_4: [], col_5: [], col_6: []};
  public break_to_display_4 = {col_1: [], col_2: [], col_3: [], col_4: [], col_5: [], col_6: []};
  public break_to_display_5 = {col_1: [], col_2: [], col_3: [], col_4: [], col_5: [], col_6: []};

  public volume = 0;
  public mic = 0;

  //  Bootstrap widths
  public lg = 992;
  public md = 768;
  public sm = 576;
  public innerWidth: any;

  public sidetripmode = false;

  public current_lesson_title: string = '000';
  public show_setting_modal: boolean = false;
  public show_feedback_modal: boolean = false;

  constructor(
  	private DL: DataloaderService,
    private notify: SnotifyService,
    private translate: TranslateService,
    private Option: OptionService,
    private router: Router,
    private el: ElementRef
  ) {
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(Option.getFallbackLocale());

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(Option.getLocale());
  }

  ngOnInit() {

    this.DL.getStudentInfo().subscribe(
        data => this.handleStudentInfo(data),
        error => {
          console.log(error);
          this.notify.error('Student info load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
        }
    );

  	this.DL.getLessons().subscribe(
  		data => this.handleLessons(data),
      	error => {
      		console.log(error);
      		this.notify.error('Lessons list load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
      	}
  	);

    this.innerWidth = window.innerWidth;

    this.Option.change_language_event.subscribe(()=>{
      console.log('Change language event.');
      this.translate.use(this.Option.getLocale());
    })

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.updateBreaks();
  }

  handleStudentInfo(data){
    console.log('Student Info:');
    console.log(data);
    let exp = data.link_expire;
    let that = this;
    this.student.name = data.user_name;
    this.student.lu = data.last_uncomplete;
    this.student.sid_message = data.sid_message;
    
    this.Option.setLanguage(data.options.language);

    if(typeof data.link_expire !== 'undefined' && data.link_expire){
      //  Timeout needed to wait until lang setup will ready
      //setTimeout(()=>{
      this.translate.onLangChange.subscribe(()=>{
        that.student.sid_message = that.translate.instant('your_link_expired_soon') + ' ' + exp +
          '. ' + that.translate.instant('contact_administrator');
      });
      
    }
  }

  handleLessons(data){
  	console.log('Lessons:');
  	console.log(data);
    this.lessons = data;
    this.sortLessonsBreaks();
    this.updateBreaks();
    if(this.student.lu !== 0) this.current_lesson_title = this.getCurrentLessonTitle(this.student.lu);

    //  Show main screen
    this.el.nativeElement.querySelector('.book-container').style.opacity = '1';
  }

  //  Devide lessons to breaks
  sortLessonsBreaks() {
    for(var i in this.lessons){
      let l = this.lessons[i];
      if(l.section === 'Break 1') this.break_1.push(l);
      if(l.section === 'Break 2') this.break_2.push(l);
      if(l.section === 'Break 3') this.break_3.push(l);
      if(l.section === 'Break 4') this.break_4.push(l);
      if(l.section === 'Break 5') this.break_5.push(l);
    }
  }


  //  Transform break to columns
  rebuildLessonsListToWidth(lessons_break){

    //  Result cols
    let col_1 = [];
    let col_2 = [];
    let col_3 = [];
    let col_4 = [];
    let col_5 = [];
    let col_6 = [];

    //  Total lessons number in break
    let l = lessons_break.length;

    //  Go over all lessons
    for(let ik in lessons_break){
      let lb = lessons_break[ik];
      let i = parseInt(ik);
      //  If screen is large
      if(this.innerWidth >= this.lg){
        let step = Math.ceil(l/6);
        if(i < step) col_1.push(lb);
        if(i >= step && i < step*2) col_2.push(lb);
        if(i >= step*2 && i < step*3) col_3.push(lb);
        if(i >= step*3 && i < step*4) col_4.push(lb);
        if(i >= step*4 && i < step*5) col_5.push(lb);
        if(i >= step*5) col_6.push(lb);
      }
      //  If screen is medium
      else if(this.innerWidth >= this.md && this.innerWidth < this.lg){
        let step = Math.ceil(l/4);
        if(i < step) col_1.push(lb);
        if(i >= step && i < step*2) col_2.push(lb);
        if(i >= step*2 && i < step*3) col_3.push(lb);
        if(i >= step*3) col_4.push(lb);
      }
      //  If screen is small
      else if(this.innerWidth >= this.sm && this.innerWidth < this.md){
        let step = Math.ceil(l/3);
        if(i < step) col_1.push(lb);
        if(i >= step && i < step*2) col_2.push(lb);
        if(i >= step*2) col_3.push(lb);
      }
      //  If screen is extra small
      else if(this.innerWidth < this.sm){
        let step = Math.ceil(l/2);
        if(i < step) col_1.push(lb);
        if(i >= step) col_2.push(lb);
      }

    }
    return {
      col_1: col_1,
      col_2: col_2,
      col_3: col_3,
      col_4: col_4,
      col_5: col_5,
      col_6: col_6
    }
  }

  updateBreaks() {
    this.break_to_display_1 = this.rebuildLessonsListToWidth(this.break_1);
    this.break_to_display_2 = this.rebuildLessonsListToWidth(this.break_2);
    this.break_to_display_3 = this.rebuildLessonsListToWidth(this.break_3);
    this.break_to_display_4 = this.rebuildLessonsListToWidth(this.break_4);
    this.break_to_display_5 = this.rebuildLessonsListToWidth(this.break_5);
    
  }

  onSidetripmode(mode: boolean) {
    this.sidetripmode = mode;
  }

  getCurrentLessonTitle(lu){
    for(let i in this.lessons){
      if(parseInt(this.lessons[i].number) === +lu) {
        let n:string = String(this.lessons[i].number);
        n = n.length === 3 ? n : n.length === 2 ? '0' + n : n.length === 1 ? '00' + n : n;
        return n;
      }
    }
  }

  //  Handle click event on lesson
  showLesson(n) {

    //  Check if sidetrip mode is enabled, redirect user to sidetrip lessons
    if(this.sidetripmode){
      this.router.navigateByUrl('/sidetrip/'+n);
      return;
    }

    //  if user selected lesson that is different to last uncomplete
    if(n !== this.student.lu){

      let that = this;

      //  if selected lesson number less than last uncomplete, show 'You've already completed this lesson' 
      if(n < this.student.lu){
        
        this.translate.get(['y_have_complete', 'next', 'next_btn', 'close']).subscribe((res) => {
            const toast = that.notify.warning(res.y_have_complete + res.next, {
              timeout: 5000,
              buttons: [
                {text: res.next_btn, action: (toast) => {console.log('Clicked: Yes'); that.location("/lesson"); that.notify.remove(toast.id);}, bold: false},
                {text: res.close, action: (toast) => {console.log('Clicked: Close'); that.notify.remove(toast.id); }, bold: true},
              ]
            });
        });
        

      } else {
      //  Esle show 'Try another lesson message'
        this.translate.get(['before_u_have_complete', 'this', 'lesson', 'close']).subscribe((res) => {
            const toast = that.notify.warning(res.before_u_have_complete + res.this, {
              timeout: 5000,
              buttons: [
                {text: res.lesson + ' ' + that.student.lu, action: (toast) => {console.log('Clicked: Yes'); that.location("/lesson"); that.notify.remove(toast.id);}, bold: false},
                {text: res.close, action: (toast) => {console.log('Clicked: Close'); that.notify.remove(toast.id); }, bold: true},
              ]
            });
        });
      }

    } else {
      this.router.navigateByUrl('/lesson');
    }

  }
  
  location(l){
    this.router.navigateByUrl(l);
  }

  onCloseMenu() {

  }

  onShowSettings() {
    this.show_setting_modal = true;
  }

  onCloseSettings() {
    this.show_setting_modal = false;
  }

  onShowFeedback() {
    this.show_feedback_modal = true;
  }

  onCloseFeedback() {
    this.show_feedback_modal = false;
  }

  disableSidetrip() {
    this.sidetripmode = false;
  }



}
