import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { SnotifyService } from 'ng-snotify';
import { TranslateService } from '@ngx-translate/core';
import { OptionService } from '../../services/option.service';
import { NotebookComponent } from '../notebook/notebook.component';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { Title } from '@angular/platform-browser';
import { PickElementService } from '../../services/pick-element.service';
import { type } from 'os';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public student = {
  	name: 'Admin',
    lu: 0,
    sid_message: 'Message',
    set_start_lesson: true,
    chatroom: "",
    related_accounts: [],
    new_user: false
  }

  public lessons = [];
  public testing_log = [];

  //  Lessons sorted by breaks
  public break_1 = [];
  public break_2 = [];
  public break_3 = [];
  public break_4 = [];
  public break_5 = [];
  public breaks = [];

  //  Break borders to define first and last lessons
  public bborder_1 = [];
  public bborder_2 = [];
  public bborder_3 = [];
  public bborder_4 = [];
  public bborder_5 = [];

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
  public show_ltk_menu: boolean = false;
  public show_rel_accounts: boolean = false;
  public show_switch_account: boolean = false;

  public current_lesson = 1;
  public current_lesson_inst: any = null;
  public cl: any = {};
  public scale = 1;
  public slide_scale = 0.96;
  public mode = 'dual';

  public show_notebook: boolean = false;
  public show_grammar: boolean = false;
  public show_testing: boolean = false;

  public sku: any = {
    title: "",
    desc: ""
  };

  public arrow_pointer: any = {
    opacity: 0,
    top: '-200px',
    left: '-200px'
  };

  public lang_change_event: any;

  public show_course_expire_msg = false;

  //  Starting lesson
  public starting_lesson: any;

  @ViewChild(NotebookComponent) nb: NotebookComponent;

  constructor(
  	private DL: DataloaderService,
    private notify: SnotifyService,
    private translate: TranslateService,
    public Option: OptionService,
    private router: Router,
    private el: ElementRef,
    private Auth: AuthService,
    private Token: TokenService,
    private title: Title,
    private pe: PickElementService
  ) {
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(Option.getFallbackLocale());

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(Option.getLocale());

        //  Collect all breaks to single array
        this.breaks.push(this.break_1);
        this.breaks.push(this.break_2);
        this.breaks.push(this.break_3);
        this.breaks.push(this.break_4);
        this.breaks.push(this.break_5);
  }

  ngOnInit() {

    //  Set dashboard title
    this.title.setTitle("LTK-Lessons-Main");

    this.DL.getStudentInfo().subscribe(
        data => this.handleStudentInfo(data),
        error => {
          console.log(error);
          this.notify.error('Student info load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
          this.Auth.changeAuthStatus(false);
          this.router.navigateByUrl('/login');
          this.Token.remove();
        }
    );

    //  Init window size
    this.innerWidth = window.innerWidth;

    //  Swith layout according to window size
    if(this.innerWidth <= 1024){
      this.mode = 'single';
    }

    this.lang_change_event = this.Option.change_language_event.subscribe(()=>{
      console.log('Change language event.');
      this.translate.use(this.Option.getLocale());
    });

    this.starting_lesson = { alias: '001' };

  }

  ngOnDestroy() {
    if(this.lang_change_event) this.lang_change_event.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.updateBreaks();
    this.scale = this.defineCurrentScale();
  }

  @HostListener('click', ['$event'])
  onClick(event) {
    this.loading_flag = false;
    this.show_rel_accounts = false;
  }

  setLesson(l) {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    
    //  Check if link is test
    if(typeof l.test !== 'undefined' && l.test !== '') {
      this.Token.setType(l.test);
      this.router.navigateByUrl('/test');
      return;
    }

    this.current_lesson = l.number;
    this.current_lesson_inst = l;
    for(let i in this.lessons){
      if(parseInt(this.lessons[i].number) === parseInt(l.number)) this.cl = this.lessons[i];
    }
    let that = this;
    setTimeout(()=>{ that.showLessonArrowPointer(); }, 400);
  }

  handleStudentInfo(data){
    console.log('Student Info:');
    console.log(data);
    let exp = data.link_expire;
    let that = this;
    this.student.name = data.user_name;
    this.student.lu = data.last_uncomplete;
    this.student.sid_message = data.sid_message;
    this.student.set_start_lesson = data.set_start_lesson;
    this.student.chatroom = data.chatroom;
    if(typeof data.related_accounts !== 'undefined') {
      this.student.related_accounts = data.related_accounts;
      if(data.related_accounts.length > 0) this.show_switch_account = true;
    }
    if(typeof data.new_user !== 'undefined') {
      this.student.new_user = data.new_user;
    }
    this.Option.setLanguage(data.options.language);
    this.Token.setEmail(data.email);
    this.Option.setOptions(data.options);

    if(typeof data.sku !== 'undefined' && data.sku) this.sku = data.sku;

    if(typeof data.link_expire !== 'undefined' && data.link_expire){
      //  Timeout needed to wait until lang setup will ready
      //setTimeout(()=>{
      this.translate.onLangChange.subscribe(()=>{
        that.student.sid_message = that.translate.instant('your_link_expired_soon') + ' ' + exp +
          '. ' + that.translate.instant('contact_administrator');
      });
      
    }

    //  Check if course expired
    if(typeof data.course_expired !== 'undefined' && data.course_expired) {
      //  Show main screen
      this.el.nativeElement.querySelector('.book-container').style.opacity = '1';

      this.show_course_expire_msg = true;
      
    } else {
      this.DL.getLessons().subscribe(
        data => this.handleLessons(data),
          error => {
            console.log(error);
            this.notify.error('Lessons list load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
          }
      );
      this.DL.getTestingLog().then(data => this.handleTestingLog(data));
    }
    
  	

  }

  handleLessons(data){
  	console.log('Lessons:');
  	console.log(data);
    this.lessons = data;
    this.sortLessonsBreaks();
    this.updateBreaks();
    if(this.student.lu !== 0) {
      this.current_lesson_title = this.getCurrentLessonTitle(this.student.lu);
      for(let i in this.lessons){
        if(parseInt(this.lessons[i].number) === this.student.lu) {
          this.cl = this.lessons[i];
        }
      }
      this.setLesson(this.cl);
    }

    //  Show main screen
    this.el.nativeElement.querySelector('.book-container').style.opacity = '1';
    this.updateTestsState();
  }

  handleTestingLog(data) {
    console.log('Testing log loaded', data);
    if(typeof data.length !== 'undefined' && data.length > 0) this.testing_log = data;
    this.updateTestsState();
  }

  addBreakTests() {
    let b = this.Option.getBreakTest(1);
    if(b) this.break_2.unshift({test: b.test, alias: this.translate.instant(b.alias), level: b.break, passed: false});
    b = this.Option.getBreakTest(2);
    if(b) this.break_3.unshift({test: b.test, alias: this.translate.instant(b.alias), level: b.break, passed: false});
    b = this.Option.getBreakTest(3);
    if(b) this.break_4.unshift({test: b.test, alias: this.translate.instant(b.alias), level: b.break, passed: false});
    b = this.Option.getBreakTest(4);
    if(b) this.break_5.unshift({test: b.test, alias: this.translate.instant(b.alias), level: b.break, passed: false});
  }

  //  Go throught all tests in a lesson list
  //  and compare it with log, then set 'passed' param
  //  if any activity in log exists according particular test
  updateTestsState() {
    if(this.testing_log.length > 0) {
      for(let b_k in this.breaks) {
        let b = this.breaks[b_k];
        //  Check if break contains test
        if(typeof b.length !== 'undefined' && b.length > 0) {
          for(let l_k in b) {
            //  Get separate lesson in break
            let l = b[l_k];
            //  Check if lesson is test
            if(typeof l.test !== 'undefined') {
              let level = l.level;
              l.passed = false;
              //  Find log according to level
              for(let lg_k in this.testing_log) {
                let lg = this.testing_log[lg_k];
                //  Check if log level match with current test level
                if(lg.level === level) {
                  //  Check if log has some info about this test
                  if(typeof lg.log !== 'undefined' && lg.log.length > 0) l.passed = true;
                }
              }
            }
          }
        }
      }
    }
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

    //  Define break borders
    if(this.break_1.length > 0) this.bborder_1 = [this.break_1[0].number, this.break_1[this.break_1.length - 1].number];
    if(this.break_2.length > 0) this.bborder_2 = [this.break_2[0].number, this.break_2[this.break_2.length - 1].number];
    if(this.break_3.length > 0) this.bborder_3 = [this.break_3[0].number, this.break_3[this.break_3.length - 1].number];
    if(this.break_4.length > 0) this.bborder_4 = [this.break_4[0].number, this.break_4[this.break_4.length - 1].number];
    if(this.break_5.length > 0) this.bborder_5 = [this.break_5[0].number, this.break_5[this.break_5.length - 1].number];

    //  Check if need break tests
    if(this.Option.breakTestEnabled()) this.addBreakTests();

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
        let n:string = String(this.lessons[i].alias);
        //n = n.length === 3 ? n : n.length === 2 ? '0' + n : n.length === 1 ? '00' + n : n;
        return n;
      }
    }
  }

  //  Handle click event on lesson
  showLesson(n) {
    //	If mouse event locked by feedback
		if(this.pe.mouseLock()) return;
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
        
        this.translate.get(['y_have_complete', 'next', 'next_btn', 'close', 'or_try_sidetrip', 'sidetrip_btn']).subscribe((res) => {
            const toast = that.notify.warning(res.y_have_complete + res.next+', '+res.or_try_sidetrip, {
              timeout: 5000,
              buttons: [
                {text: res.sidetrip_btn, action: (toast)=>{console.log('Clicked: Sidetrip'); that.location("/sidetrip/"+n); that.notify.remove(toast.id);}, bold: false},
                {text: res.next_btn, action: (toast) => {console.log('Clicked: Next'); that.checkForTesting(); that.notify.remove(toast.id);}, bold: false},
                {text: res.close, action: (toast) => {console.log('Clicked: Close'); that.notify.remove(toast.id); }, bold: true},
              ],
              bodyMaxLength: 200
            });
        });
        

      } else {
      //  Esle show 'Try another lesson message'
        this.translate.get(['before_u_have_complete', 'this', 'lesson', 'close', 'or_try_sidetrip', 'sidetrip_btn']).subscribe((res) => {
            const toast = that.notify.warning(res.before_u_have_complete + res.this+', '+res.or_try_sidetrip, {
              timeout: 5000,
              buttons: [
                {text: res.sidetrip_btn, action: (toast)=>{console.log('Clicked: Sidetrip'); that.location("/sidetrip/"+n); that.notify.remove(toast.id);}, bold: false},
                {text: res.lesson + ' ' + that.getCurrentLessonTitle(that.student.lu), action: (toast) => {console.log('Clicked: Yes'); that.checkForTesting(); that.notify.remove(toast.id);}, bold: false},
                {text: res.close, action: (toast) => {console.log('Clicked: Close'); that.notify.remove(toast.id); }, bold: true},
              ],
              bodyMaxLength: 200
            });
        });
      }

    } else {
      this.checkForTesting();
    }

  }

  //  Check if testing is required before taking lesson
  checkForTesting() {
    
      //  Check if required to pass some tests befor start a lesson
      if(this.Option.getOptions().bt_enable && this.Option.getOptions().bt_required) {
        console.log("Current lesson", this.current_lesson_inst);
        if(this.current_lesson_inst && this.testing_log.length > 0) {
          //  Get current lesson level
          let sc = this.current_lesson_inst.section.split(' ');
          let cl = parseInt(sc[sc.length - 1]);
          console.log("Current lesson level", cl);
          //  Check if test passed for level - 1
          let passed = false;
          //  Disable test for first break
          if((cl - 1) < 1) passed = true;
          else {
            for(let i in this.testing_log) {
              let tl = this.testing_log[i];
              if(tl.level === (cl - 1) && tl.log.length > 0) passed = true;
            }
          }
          //  Check if test for required level passed
          if(passed) this.router.navigateByUrl('/lesson');
          else {
            let that = this;
            this.translate.get(['y_have_to_take_test', 'test', 'close']).subscribe((res) => {
              const toast = that.notify.warning(res.y_have_to_take_test, {
                timeout: 5000,
                buttons: [
                  {text: res.test, action: (toast) => {
                      console.log('Clicked: Next'); 
                      that.Token.setType(that.Option.getBreakTest(cl-1).test);
                      that.router.navigateByUrl('/test'); 
                      that.notify.remove(toast.id);
                    }, 
                  bold: true},
                  {text: res.close, action: (toast) => {console.log('Clicked: Close'); that.notify.remove(toast.id); }, bold: true},
                ],
                bodyMaxLength: 200
              });
            });
          }
        } else {
          this.router.navigateByUrl('/lesson');
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

  onShowLtkMenu() {
    this.show_ltk_menu = true;
  }

  onCloseLtkMenu() {
    this.show_ltk_menu = false;
  }

  onShowRelaccounts($event) {
    this.show_rel_accounts = !this.show_rel_accounts;
    $event.preventDefault();
    $event.stopPropagation();
  }
  onRelaccountsScreenPrevent($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  onCloseRelaccounts() {
    this.show_rel_accounts = false;
  }

  disableSidetrip() {
    //	If mouse event locked by feedback
		if(this.pe.mouseLock()) return;
    this.sidetripmode = false;
  }

  defineCurrentScale() {

    //  Calc initial scale to fit card on the page
    //  Take width of 90% available card space
    let zb = this.el.nativeElement.querySelector('.zoom-frame');
    if(zb === null) return 1;
    let z = zb.clientWidth*this.slide_scale;

    
    //  Default double cards width
    let cbi = null;
    this.el.nativeElement.querySelectorAll('.card-block-item').forEach((e)=>{
      if(e.clientWidth !== 0 && e.clientHeight !== 0) cbi = e;
    });
    if(cbi === null) return 1;
    let c = cbi.clientWidth;
    if(this.mode === 'single') {
      c = 400;
    }
      
    if((z/c * cbi.clientHeight) > zb.clientHeight){
      z = zb.clientHeight*this.slide_scale;
      c = cbi.clientHeight;
    }
    

    let scale = z/c;
    if(scale > 2.4) scale = 2.4;
    return scale;
  }

  onShowGrammar(){
    this.show_notebook = false;
    this.show_testing = false;
    this.show_grammar = !this.show_grammar;
    console.log("Show grammar.");
    let that= this;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
  }

  onShowNotebook(){
    console.log("Show Notebook.");
    this.show_grammar = false;
    this.show_testing = false;
    let that = this;
    this.show_notebook = !this.show_notebook;
    this.nb.lesson_num = this.student.lu;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
  }

  onCloseNotebook() {
    console.log("Close Notebook.");
    this.show_grammar = false;
    this.show_testing = false;
    let that = this;
    this.show_notebook = false;
    //this.nb.lesson_num = this.student.lu;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
  }

  //  Show Testing
  onShowTesting() {
    this.show_notebook = false;
    this.show_grammar = false;
    this.show_testing = !this.show_testing;
    let that= this;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
  }

  onCloseTesting() {
    this.show_notebook = false;
    this.show_grammar = false;
    this.show_testing = false;
    let that= this;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
  }


  public pointer_cycle = null;
  showLessonArrowPointer() {
    let target = null;
    if(this.cl.theme) {
      target = this.el.nativeElement.querySelector('.button-with-theme');
    } else {
      target = this.el.nativeElement.querySelector('.button-without-theme');
    }

    //console.log(target);
    if(target){
      /*
      let parentOffset = target.offsetParent;
      let totalLeft = target.offsetLeft;
      let totalTop = target.offsetTop;
      let totalHeight = target.clientHeight;
      let totalWidth = target.clientWidth;
      while(typeof parentOffset.offsetParent !== 'undefined' && parentOffset.offsetParent){
        totalLeft += parentOffset.offsetLeft;
        totalTop += parentOffset.offsetTop;
        parentOffset = parentOffset.offsetParent;
      };

      console.log('Left:  ' + totalLeft + '   Top:  ' + totalTop + '  Height:  ' + totalHeight + '  Width:  ' + totalWidth);

      
      that.arrow_pointer = {
        opacity: 1,
        top: (totalTop - 120) + 'px',
        left: (totalLeft + (totalWidth/2) - 15) + 'px'
      }
      */
      let page = this.el.nativeElement.querySelector('#main-app-screen');
      page.scrollTop = page.scrollHeight - window.innerHeight;
      target.classList.add('pointerhilight');
      let that = this;
      clearTimeout(this.pointer_cycle);
      this.pointer_cycle = setTimeout(()=>{
        /*
        that.arrow_pointer = {
          opacity: 0,
          top: '-200px',
          left: '-200px'
        }
        */
        target.classList.remove('pointerhilight');
        that.pointer_cycle = setTimeout(()=>{
          target.classList.add('pointerhilight');
          that.pointer_cycle = setTimeout(()=>{
            target.classList.remove('pointerhilight');
          }, 600);
        }, 600);
      }, 600);

    }

  }

  public loading_flag: boolean = false;
  relLogin(email) {
    let that = this;
    this.DL.relatedLogin({email: email}).subscribe(
      data => this.handleResponse(data),
      //error => this.handleError(error)
      error => {
        alert(error.error.error);
        console.log(error);
        that.loading_flag = false;
      }
    );
    this.loading_flag = true;
  }

  handleResponse(data) {

    //  Check if we received expired link message
    if(typeof data.expired !== 'undefined' && data.expired){
      console.log('Link expired');
      console.log(data);
      alert('Link expired');
      return;
    }

    this.Token.handle(data.access_token);
    this.Auth.changeAuthStatus(true);
    //this.router.navigateByUrl('/home');
    this.router.navigateByUrl('/reports', {skipLocationChange: true})
      .then(() => this.router.navigate(['/home']));
      this.loading_flag = false;
  }

  setStartingLesson(l) {
    let that = this;
    this.starting_lesson = l;
    this.DL.setStartingLesson(l.number).then(()=>{
      that.router.navigateByUrl('/reports', {skipLocationChange: true})
      .then(() => that.router.navigate(['/home']));
    }).catch((e)=>{
      console.log("Error during set starting lesson", e);
      alert("Error during set starting lesson");
    });
  }

}
