import { Component, OnInit, HostListener, ViewChild, ComponentFactoryResolver, AfterViewInit, ViewEncapsulation, ElementRef, OnDestroy, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { DataloaderService } from '../../services/dataloader.service';
import { SnotifyService } from 'ng-snotify';
import { TranslateService } from '@ngx-translate/core';
import { OptionService } from '../../services/option.service';
import { CardbuilderService } from '../../services/cardbuilder.service';
import { RecorderService } from '../../services/recorder.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { MediapreloaderService } from '../../services/mediapreloader.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { CustomfieldService } from '../../services/customfield.service';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { CardDirective } from '../../directives/card.directive';
import { CardItem } from '../../card-item';
import { CardComponent } from '../card/card.component';
import { NotebookComponent } from '../notebook/notebook.component';
import { ShowtestingComponent } from '../showtesting/showtesting.component';
import { Howl, Howler } from 'howler';
import * as $ from 'jquery';
import { GrammarComponent } from '../grammar/grammar.component';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.component.html',
  styleUrls: ['./lesson.component.scss'],
})
export class LessonComponent implements OnInit, AfterViewInit {

  public student = {
  	name: 'Admin',
    lu: 0,
  	sid_message: 'Message',
    options: {
      expertlevel: "5",
      language: "english",
      mic: "50",
      quickpace: "1",
      replevel: "50",
      screencolor: "1",
      volume: "1"
    }
  }

  public start_position: any;

  public current_lesson_title: string = '000';
  public sidetripmode = false;
  public innerWidth: any;
  public innerHeight: any;
  public show_tool_pages_list: boolean = true;
  public show_start_screen: boolean = true;
  public show_setting_modal: boolean = false;
  public show_feedback_modal: boolean = false;
  public show_warncomplete_modal: boolean = false;
  public show_snooze: boolean = false;
  public mode = 'dual';
  public cpos: number = 2;
  public scale: number = 0.9;
  //  Special scale for slide mode
  public slide_scale = 0.96;

  @ViewChild(CardDirective) appCard: CardDirective;
  @ViewChild(NotebookComponent) nb: NotebookComponent;
  @ViewChild(ShowtestingComponent) sht: ShowtestingComponent;
  @ViewChild(GrammarComponent) grm: GrammarComponent;

  public cards: CardItem[];
  public downloaded_cards = [];
  public default_waves: any;
  public global_start: boolean = false;
  public shownext: boolean = false;
  public showprev: boolean = false;
  public next_slide_enable: boolean = true;
  public current_id = 0;
  public card_total = 0;
  public repeat_url = '';
  public global_header = 'LTK';
  public default_header = 'LTK';
  public global_desc = 'LTK';

  //  Buffer for cards components
  public ccs = [];

  //  Lesson number for sidetrip mode
  public n: number;
  private sub: any;

  public blinkenter: boolean = false;
  public blinknextnavbtn: boolean = false;
  public blinkgoodbad: boolean = false;
  public blinkrec: boolean = false;
  public blinkplay: boolean = false;
  public blinkrule: boolean = false;

  public rui_button_hint: boolean = false;
  public rui_button_clear: boolean = false;
  public rui_button_rule: boolean = false;
  public rui_button_goodbad: boolean = false;
  public rui_button_prev: boolean = false;
  public rui_button_enter: boolean = false;
  public page_is_loading_screen: boolean = true;
  public main_app_screen: boolean = false;
  public beep_start_sound: any;
  public yhnry_sound: any;
  public global_recorder: boolean = false;
  public end_lesson_flag: boolean = false;
  public recstart_event: EventEmitter<any> = new EventEmitter();
  public recstop_event: EventEmitter<any> = new EventEmitter();
  public playstart_event: EventEmitter<any> = new EventEmitter();
  public playstop_event: EventEmitter<any> = new EventEmitter();
  public good_btn: EventEmitter<any> = new EventEmitter();
  public bad_btn: EventEmitter<any> = new EventEmitter();
  public prev_btn: EventEmitter<any> = new EventEmitter();

  public show_notebook: boolean = false;
  public show_grammar: boolean = false;
  public show_testing: boolean = false;

  public start_button_animation: any = null;
  public lesson_finished: boolean = false;

  public route_change_event: any;
  public color_change_event: any;
  public student_info_event: any;
  public lang_change_event: any;

  public card_descriptor = {
    lesson: 0,
    position: 0,
    activity: ''
  }

  public snooze_timer: any = null;
  public snooze_time = 0;
  public snooze_delay = 180;

  //  Flag for enabling stop of media playback on any user action
  public action_media_stop = true;

  constructor(
    private DL: DataloaderService,
    private notify: SnotifyService,
    private translate: TranslateService,
    private Option: OptionService,
    private router: Router,
    private CB: CardbuilderService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private el:ElementRef,
    private route: ActivatedRoute,
    private recorder: RecorderService,
    private playmedia: PlaymediaService,
    private preloader: MediapreloaderService,
    private logging: LoggingService,
    private cs: ColorschemeService,
    private cf: CustomfieldService,
    private Auth: AuthService,
    private Token: TokenService,
    private title: Title
  ) {
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(Option.getFallbackLocale());

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(Option.getLocale());
  }

  ngOnInit() {

    //  Set lessons title
    this.title.setTitle('LTK-Lessons');

    //  Init studetn information
    this.student_info_event = this.DL.getStudentInfo();
    this.student_info_event.subscribe(
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
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;

    //  Swith layout according to window size
    if(this.innerWidth <= 1024){
      this.mode = 'single';
      this.show_tool_pages_list = false;
    }

    this.sub = this.route.params.subscribe(params => {
      if(params.hasOwnProperty('n')){
        this.n = +params['n']; // (+) converts string 'id' to a number
        this.sidetripmode = true;
        this.setSidetripMode(true);
        console.log('Application runned in sidetrip mode!');
      }

    });

    this.color_change_event = this.cs.onChange().subscribe(()=>{
      console.log('Change color scheme event.');
      if(this.global_start) this.refreshLesson();
    });

    this.lang_change_event = this.Option.change_language_event.subscribe(()=>{
      console.log('Change language event.');
      this.translate.use(this.Option.getLocale());
    });

    let that = this;

    this.route_change_event = this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe((e) => {
        if(that.router.getCurrentNavigation().previousNavigation.extractedUrl.toString() === "/lesson"){
          if(!this.end_lesson_flag){
            console.log('Router Event. Try to save current user results');
            this.urgentLeaveLesson();
            alert('Do you want to leave this lesson?');
          }
        }
        
    });

    
    that.beep_start_sound = new Howl({
      src: 'beep.mp3',
      autoplay: false,
      loop: false,
      volume: 0.7,
      rate: 1.8
    });

    that.yhnry_sound = new Howl({
      src: 'YHNRY.mp3',
      autoplay: false,
      loop: false,
      volume: 0.7,
      rate: 1
    });


    
     
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.route_change_event.unsubscribe();
    this.lang_change_event.unsubscribe();
    this.color_change_event.unsubscribe();
    //this.student_info_event.unsubscribe();
  }


  ngAfterViewInit() {

  }

  updateLesson() {
    this.loadComponent();
    this.setCurrentMode(this.mode);
    this.scale = this.defineCurrentScale();
    this.setCurrentScale(this.scale);
    this.setCurrentCardPosition(this.cpos);
    let that = this;
    setTimeout(()=>{ that.refreshNav(); that.setCurrentCardDescriptor(); }, 100);
    //this.setGlobalRecorder(true);
    this.setSidetripMode(this.sidetripmode);
    this.setGlobalStart(this.global_start);
  }

  refreshLesson() {
    
    this.setCurrentMode(this.mode);
    this.scale = this.defineCurrentScale();
    this.setCurrentScale(this.scale);
    this.setCurrentCardPosition(this.cpos);
    
  }


  //  Handle sidetrip enable/disable event from msmenu (main sidebar menu)
  onSidetripmode(mode: boolean) {
    this.sidetripmode = mode;
    this.setSidetripMode(mode);
  }


  //  Change layout on window resize
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    if(this.innerWidth <= 1024){
      this.mode = 'single';
      this.show_tool_pages_list = false;
    } else {
      this.mode = 'dual';
      this.show_tool_pages_list = true;
    }
    this.refreshLesson();
  }

  //  Stop active log when user leave card page
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event) {
      
      if(!this.end_lesson_flag && !this.show_snooze){
        this.urgentLeaveLesson();
        let dialogText = 'Do you want to leave this lesson?';
        event.returnValue = dialogText;
        return dialogText;
      }
  }

  //  Handle keydown events
  @HostListener('window:keydown', ['$event'])
  onKeydow(event) {
      this.resetSnoozeTime();
      if(event.keyCode == 37) this.movePrev();
      if(event.keyCode == 39) this.moveNext();
      if(event.keyCode == 13) this.enter();
  }

  //  Mouse move events
  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:mousedown', ['$event'])
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchstart', ['$event'])
  @HostListener('window:touchend', ['$event'])
  @HostListener('window:click', ['$event'])
  onMovement(event) {
      this.resetSnoozeTime();
  }

  urgentLeaveLesson() {
    
      if(!this.end_lesson_flag && !this.sidetripmode){

        let sc = this.getChildCardScope(this.current_id);
        if(typeof sc !== 'undefined' && sc !== null && typeof sc.prehide !== 'undefined'){
          sc.prehide();
        } 
        if(typeof sc !== 'undefined' && sc !== null && typeof sc.hide !== 'undefined'){

          this.loggingEndCommand(sc);

          sc.hide();
        } 

        this.logging.lessonTimeon(this.student.lu)
        .subscribe(
          data => {},
          error => {
            console.log(error);
            this.notify.error('Lesson Timeon status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
          }
        );
      }
    
  }

  getCurrentLessonTitle(lu){
    
        let n:string = String(lu);
        n = n.length === 3 ? n : n.length === 2 ? '0' + n : n.length === 1 ? '00' + n : n;
        return n;
     
  }

  getCardDescriptor() {
    return '#'+this.card_descriptor.lesson+'-'+this.card_descriptor.position+':'+this.card_descriptor.activity;
  }

  //  Handle loaded student info
  handleStudentInfo(data){
    console.log('Student Info:');
    console.log(data);

    this.student.name = data.user_name;
    this.student.lu = data.last_uncomplete;
    this.student.sid_message = data.sid_message;
    this.logging.setCurrentLesson(this.student.lu);
    this.recorder.setGain(+data.options.mic);
    this.playmedia.setVolume(+data.options.volume);
    this.global_volume = +data.options.volume;
    this.playmedia.setRate(0.8 + (parseInt(data.options.expertlevel)*0.08));
    this.cs.setScheme(+data.options.screencolor);
    this.Option.setLanguage(data.options.language);
    this.Option.setOptions(data.options);
    //  Check if start position is setted
    if(typeof data.start !== 'undefined' && !this.sidetripmode) this.start_position = data.start;
    
    //  Start loading cards according to last uncomplete lesson
    if(!this.sidetripmode){
      this.loadCards(this.student.lu);
      this.current_lesson_title = this.getCurrentLessonTitle(this.student.lu);
      this.card_descriptor.lesson = this.student.lu;
      console.log('Run normally, start position setted to '+this.start_position+'!');
      this.title.setTitle('LTK-Lesson-'+this.card_descriptor.lesson);
    } else {
      this.loadCards(this.n);
      this.current_lesson_title = this.getCurrentLessonTitle(this.n);
      this.card_descriptor.lesson = this.n;
      this.start_position = 0;
      console.log('Run sidetrip, start position setted to start!');
      //  Setup lesson for testing
      //  Subscription execution issue, to keep sequence and set last uncomplete in a right order
      //  set lu for sidetrip with some delay
      let that = this;
      setTimeout(()=>{ that.DL.lu = +that.n; }, 20);
      this.title.setTitle('LTK-Lessons-Sidetrip'+this.n);
    }
    
  }

  //  Start cards loading process
  loadCards(lesson) {
    console.log('Start loading cards: ' + new Date().getTime());
    this.DL.getCards(lesson).subscribe(
        data => this.handleCards(data),
        error => {
          console.log(error);
          this.notify.error('Cards load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
        }
    );
    
  }

  loadComponent() {
    
    let cards = this.CB.getCards(this.downloaded_cards);
    let that = this;

    let viewContainerRef = this.appCard.viewContainerRef;
    viewContainerRef.clear();

    for(let i = cards.length-1; i >= 0; i--){
      let card = cards[i];
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(card.component);

      let componentRef = viewContainerRef.createComponent(componentFactory);
      (<CardComponent>componentRef.instance).data = card.data;

      (<CardComponent>componentRef.instance).recstart_event = this.recstart_event;
      (<CardComponent>componentRef.instance).recstop_event = this.recstop_event;
      (<CardComponent>componentRef.instance).playstart_event = this.playstart_event;
      (<CardComponent>componentRef.instance).playstop_event = this.playstop_event;
      (<CardComponent>componentRef.instance).good_btn = this.good_btn;
      (<CardComponent>componentRef.instance).bad_btn = this.bad_btn;
      (<CardComponent>componentRef.instance).prev_btn = this.prev_btn;
      
      (<CardComponent>componentRef.instance).mnext.subscribe(function(){
        that.moveNext();
      });
   
      (<CardComponent>componentRef.instance).mprev.subscribe(function(){
        that.movePrev(); 
      });

      (<CardComponent>componentRef.instance).blinkenter.subscribe(function(){
        that.blinkEnter(); 
      });

      (<CardComponent>componentRef.instance).blinkrule.subscribe(function(){
        that.blinkRule(); 
      });

      (<CardComponent>componentRef.instance).blinknextnavbtn.subscribe(function(){
        that.blinkNextNavBtn(); 
      });

      (<CardComponent>componentRef.instance).default_waves = this.default_waves;

      (<CardComponent>componentRef.instance).option_hide.subscribe(function(){
        that.optionHide(); 
      });

      (<CardComponent>componentRef.instance).enter_hide.subscribe(function(){
        that.enterHide(); 
      });

      (<CardComponent>componentRef.instance).show_good_bad.subscribe(function(){
        that.showGoodBad(); 
      });

      (<CardComponent>componentRef.instance).show_hint.subscribe(function(){
        that.showHint(); 
      });

      (<CardComponent>componentRef.instance).show_prev.subscribe(function(){
        that.showPrev(); 
      });

      (<CardComponent>componentRef.instance).show_clear.subscribe(function(){
        that.showClear();
      });

      (<CardComponent>componentRef.instance).show_rule.subscribe(function(){
        that.showRule();
      });

      (<CardComponent>componentRef.instance).show_enter.subscribe(function(){
        that.showEnter();
      });

      (<CardComponent>componentRef.instance).set_card_id.subscribe(function(e){
        that.setCurrentCardId(e);
      });

      (<CardComponent>componentRef.instance).blink_good_bad.subscribe(function(){
        that.blinkGoodBadBtn();
      });

      (<CardComponent>componentRef.instance).blinkrec.subscribe(function(){
        that.blinkRecBtn();
      });

      (<CardComponent>componentRef.instance).blinkplay.subscribe(function(){
        that.blinkPlayBtn();
      });

      (<CardComponent>componentRef.instance).disable_next_slide.subscribe(function(){
        that.disableNextSlide();
      });

      (<CardComponent>componentRef.instance).enable_next_slide.subscribe(function(){
        that.enableNextSlide();
      });

      (<CardComponent>componentRef.instance).set_global_header.subscribe(function(e){
        that.global_header = e;
      });

      (<CardComponent>componentRef.instance).set_default_header.subscribe(function(e){
        that.global_header = that.default_header;
      });

      (<CardComponent>componentRef.instance).set_global_desc.subscribe(function(e){
        that.global_desc = e;
      });
      
      this.ccs.push(componentRef);
    }
    
  }

  //  Handle cards when it loaded
  handleCards(data) {
      console.log('Cards loaded:');
      console.log(data);
      console.log('Finished cards: ' + new Date().getTime());
      this.downloaded_cards = data.cards;

      //  Init media preloader
      this.preloader.setData(data.cards);

      //  Find SET card and setup default waves
      for(let i in data.cards){
          let cr1 = data.cards[i];
          if(cr1.type === 'set'){
            this.default_waves = cr1.content[0];
            break;
          }
      }
      this.card_total = data.cards.length;
      this.page_is_loading_screen = false;
      this.main_app_screen = true;

      //  Check if setted start position, correct cpos according to it
      if(typeof this.start_position !== 'undefined' && this.start_position !== null && this.start_position >= 2){
        let current_cpos = parseInt(data.cards[1].pos);
        console.log("Start position search start:");
        for(let i in data.cards){
          let c = data.cards[i];
          if(parseInt(c.position) === this.start_position){
            current_cpos = c.pos;
            console.log({search_card_position: c.position, required_position: this.start_position, current: current_cpos});
          }
        }
        console.log("Start position search finish, selected position: "+current_cpos);
        this.cpos = current_cpos;
      } else {
        console.log("Start position setted default!");
        this.cpos = parseInt(data.cards[1].pos);
      }

      if(typeof data.custom_fields !== 'undefined') this.cf.setFields(data.custom_fields);

      //  Check for start and end custom fields in lesson
      if(this.cf.has_start_lesson) this.cpos = this.cf.addStartCardToLesson(this.downloaded_cards, this.cpos); this.card_total = this.downloaded_cards.length;
      if(this.cf.has_end_lesson) this.cf.addEndCardToLesson(this.downloaded_cards); this.card_total = this.downloaded_cards.length;

      //  Opacity fade in animation
      let that = this;
      setTimeout(()=>{
        //that.el.nativeElement.querySelector('#main-app-screen').style.opacity = '1';
        $('#main-app-screen').css('opacity', '1');
      }, 10);

      //  Preload 'Set card media'
      this.preloader.loadCard(1);
      //  Preload action sounds
      this.preloader.preloadActionSounds();
      //  Preload media for current card
      this.preloader.loadCard(this.cpos);

      //  Set default header from last card
      if(typeof this.downloaded_cards !== 'undefined' && this.downloaded_cards.length > 0){
        //  Last card
        let lc = this.downloaded_cards[this.downloaded_cards.length - 1];
        //  Check if last card is SYP and it has header
        if(lc.activity === 'SYP' && typeof lc.content !== 'undefined' && lc.content.length > 0 && 
            typeof lc.content[0].Cmd01 !== 'undefined' && lc.content[0].Cmd01.length > 0 &&
            typeof lc.content[0].Cmd01[0].header !== 'undefined'){
          this.default_header = lc.content[0].Cmd01[0].header;
        }
        
      }

      //  Blink start button
      this.blinkStartButton();
      
  }

  startLesson() {
    this.show_start_screen = false;
    let that = this;
    if(!this.recorder.recorder_init_ready) this.recorder.init();
    clearInterval(this.start_button_animation);
    function enableLesson(){
        that.global_start = true;
        that.setGlobalStart(true);
        //that.global_recorder = that.recorder.audio_context_enable;
        //that.setGlobalRecorder(that.global_recorder);
        that.playmedia.setVolume(that.global_volume);
        
        that.updateLesson();
        that.lesson_finished = false;
      }

      let wait_audio_ctx_counter = 0;
      let waitForAudioContext = function() {
        if(!that.recorder.audio_context_enable) {
          if(wait_audio_ctx_counter > 10){
            alert(that.translate.instant('mic_disabled_msg'));
            that.global_recorder = false;
            that.setGlobalRecorder(that.global_recorder);
            enableLesson();
            return;
          } else {
            setTimeout(waitForAudioContext, 150);
            wait_audio_ctx_counter++;
            return;
          }
          
        } else {
          that.global_recorder = true;
          setTimeout(()=>{ that.setGlobalRecorder(that.global_recorder); }, 100);
          enableLesson();
        }
      }
      waitForAudioContext();
      //  Send activity log begin Lesson message
      if(!this.sidetripmode){
        this.logging.lessonBegin(this.student.lu)
          .subscribe(
            data => {},
            error => {
              console.log(error);
              this.notify.error('Lesson Begin status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
            }
          );
      }

      //  Start snooze timer
      this.startSnoozeTimer();
  }

  setCurrentCardPosition(pos) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      c.instance.cpos = pos;
    }
  }

  setCurrentMode(mode) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      c.instance.mode = mode;
    }
  }

  setGlobalRecorder(mode) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      c.instance.global_recorder = mode;
    }
  }

  setSidetripMode(mode) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      c.instance.sidetripmode = mode;
    }
  }

  setGlobalStart(mode) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      c.instance.global_start = mode;
    }
  }

  setCurrentScale(scale) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      c.instance.scale = scale;
    }
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
  
  //  Logging comand end
  loggingEndCommand(sc, cb=()=>{}) {

    //  Disable validation check for cards, now all student activity on card will be logged
    if(typeof sc.card.activity !== 'undefined' && typeof sc.card.position !== 'undefined' && !sc.activity_log_sent){
      sc.activity_log_sent = true;
      if(!this.sidetripmode){
        this.logging.commandEnd(sc.card.activity, sc.card.position, sc.errors_log, sc.current_presented, this.student.lu, sc.complete)
          .subscribe(
            data => { cb(); },
            error => {
              console.log(error);
              this.notify.error('Logging End Command status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
            }
          );
      } else {
        cb();
      }
    }

    //  Logging of test results

    else if(typeof sc.card.activity !== 'undefined' && typeof sc.card.position !== 'undefined' && typeof sc.test_log_sent !== 'undefined' && !sc.test_log_sent) {
      //if(!this.sidetripmode){
        this.logging.testEnd(sc.card.activity, sc.card.position, sc.test_results, sc.current_presented, this.DL.lu, sc.complete)
          .subscribe(
            data => { cb(); },
            error => {
              console.log(error);
              this.notify.error('Logging End Test status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
            }
          );
      //} else {
      //  cb();
      //S}
      sc.clearResults();
    }

    //cb();
  }


  refreshNav() {
    //  Show next button flag
    this.shownext = ((this.cpos < this.card_total) && this.next_slide_enable) ? true : false;

    //  Show prev button flag for single card layout (2 because of SET card exists in each lesson on 1st plase and not shown)
    this.showprev = this.cpos > 2 ? true : false;
    
    //  Update card scale faktor
    //setTimeout(function(){
    //  this.defineCurrentScale();
    //}, 2000);
  }

  checkForLessonFinish() {
      let that = this;
      //  Check if last card was reached and then finish the lesson
      if(this.cpos === this.ccs.length + 1){
        let sc = this.getChildCardScope(this.current_id);
        if(typeof sc !== 'undefined' && sc !== null && typeof sc.prehide !== 'undefined'){
          sc.prehide();
        }
        if(typeof sc !== 'undefined' && sc !== null && typeof sc.hide !== 'undefined'){
          this.loggingEndCommand(sc, function(){
            that.finishLesson(); 
          });
        } else {
          this.finishLesson();
        } 
        return true;
      } else {
        return false;
      }
  }


  public navigation_switch_flag: boolean = false;

  moveNext() {
    let that = this;
    
    //  Try to resume audio context
    this.resumeAudioContext();

    //  Check delay
    if(this.navigation_switch_flag) return;
    this.navigation_switch_flag = true;
    setTimeout(function(){ that.navigation_switch_flag = false; }, 300);

    //  Check if lesson was not started yet, start it
    if(!this.global_start && !this.show_grammar && !this.show_notebook && !this.show_testing){
      this.startLesson();
      return;
    }

    
    //  Check if add-ons is opened, direct next event to this add ons
    if(this.show_grammar || this.show_notebook || this.show_testing){
      if(this.show_testing){
        //this.sht.next();
        this.show_testing = false;
        if(!this.global_start){
          this.show_start_screen = true;
        }
      }
      if(this.show_notebook){
        if(this.nb.isNotebook){
          this.show_notebook = false;
          if(!this.global_start){
            this.show_start_screen = true;
          }
        } else {
          this.nb.enter();
        }
      }
      if(this.show_grammar){
        //this.grm.enter();
        this.show_grammar = false;
        if(!this.global_start){
          this.show_start_screen = true;
        }
      }
      return;
    }


    //  if global rights for next card is not setted, return. This means that card is not
    //  fully completed or there are some errors in user input data (validation method of the card return false)
    if(!this.shownext){
      let sc = this.getChildCardScope(this.current_id);
      if(typeof sc !== 'undefined' && sc !== null && typeof sc.next !== 'undefined'){
        sc.next();
      }
      
      this.checkForLessonFinish();

      return;
    }

    //  When user try to switch to another card, it will need to call hide
    //  method on current card before switch, where performs validation of user input
    //  and shows/plays some messages to user
    let sc = this.getChildCardScope(this.current_id);
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.complete !== 'undefined' && sc.complete < 100 && this.cpos === sc.card.pos && !this.sidetripmode){
    //if(typeof sc !== 'undefined' && sc !== null && typeof sc.complete !== 'undefined' && sc.complete < 100 && this.cpos === sc.card.pos){
      this.showWarnComplete();
      return;
    } 
    

    //  Waiting for stop audio recording if it was started
    //if(!this.checkForStopAudioRec(this.moveNext, false)) return;
    
    //  If audio convertation are in progress, waiting and try again later
    //if(this.waiting_for_activity_log_audio_convertation){
    //  setTimeout(function(){
    //    that.moveNext();
    //  }, 30);
    //  return;
    //}
    
    this.switchToNextCard();

  }

  switchToNextCard() {

    //  When user try to switch to another card, it will need to call hide
    //  method on current card before switch, where performs validation of user input
    //  and shows/plays some messages to user
    let sc = this.getChildCardScope(this.current_id);
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.prehide !== 'undefined'){
      sc.prehide();
    } 
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.hide !== 'undefined'){

      this.loggingEndCommand(sc);

      sc.hide();
    } 

    //  Disable next button until activity directive doesn't check user input and allow moving forvard
    this.next_slide_enable = true;
    
    //  Move to the next slide
    if(this.cpos < 0) this.cpos = 0;

    this.cpos++;
    this.setCurrentCardPosition(this.cpos);

    this.refreshNav();
    
    //  Preload media
    let that = this;
    setTimeout(()=>{ that.preloader.loadCard(this.cpos); }, 1600);

    this.setCurrentCardDescriptor();
    
  }

  movePrev() {
    let that = this;
    
    //  Check delay
    if(this.navigation_switch_flag) return;
    this.navigation_switch_flag = true;
    setTimeout(function(){ that.navigation_switch_flag = false; }, 600);

    if(!this.showprev) return;
    
    //  When user try to switch to another card, it will need to call hide
    //  method on current card before switch, where performs validation of user input
    //  and shows/plays some messages to user
    let sc = this.getChildCardScope(this.current_id);
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.prehide !== 'undefined'){
      sc.prehide();
    } 
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.hide !== 'undefined'){
      sc.hide();
    } 
    
    //  Waiting for stop audio recording if it was started
    //if(!this.checkForStopAudioRec(this.movePrev, false)) return;
    
    //  If audio convertation are in progress, waiting and try again later
    //if(this.waiting_for_activity_log_audio_convertation){
    //  setTimeout(function(){
    //    that.movePrev();
    //  }, 30);
    //  return;
    //}
    
    //  Disable next button until activity directive doesn't check user input and allow moving forvard
    this.next_slide_enable = true;
    
    //  Move to the prev slide
    this.cpos--;
    this.setCurrentCardPosition(this.cpos);
    this.refreshNav(); 

    this.setCurrentCardDescriptor();
    
  }

  setCurrentCardDescriptor() {
    let that = this;
    setTimeout(()=>{
      that.card_descriptor.position = that.cpos;
      let sc = this.getChildCardScope(that.current_id);
      if(typeof sc !== 'undefined' && sc !== null && typeof sc.card !== 'undefined'){
        that.card_descriptor.activity = sc.card.activity;
      } else {
        that.card_descriptor.activity = '';
      }

      //  Store updated descriptor to DataLoader service to share it between other components
      that.DL.card_descriptor = that.getCardDescriptor();

    }, 200);
  }

  disableNextSlide() {
    this.next_slide_enable = false;
    this.refreshNav();
  }

  enableNextSlide() {
    this.next_slide_enable = true;
    this.refreshNav();
  }

  blinkEnter() {

    let that = this;

    setTimeout(()=>{
      that.blinkenter = true;
      setTimeout(()=>{
        that.blinkenter = false;
        setTimeout(()=>{
          that.blinkenter = true;
          setTimeout(()=>{
            that.blinkenter = false;
          }, 400);
        }, 400);
      }, 400);
    }, 400);

  }

  blinkRule() {

    let that = this;

    setTimeout(()=>{
      that.blinkrule = true;
      setTimeout(()=>{
        that.blinkrule = false;
        setTimeout(()=>{
          that.blinkrule = true;
          setTimeout(()=>{
            that.blinkrule = false;
          }, 400);
        }, 400);
      }, 400);
    }, 400);

  }

  blinkNextNavBtn() {

    let that = this;

    //  Check if current card is last call finish lesson method
    if(this.checkForLessonFinish()) return;

    setTimeout(()=>{
      that.blinknextnavbtn = true;
      setTimeout(()=>{
        that.blinknextnavbtn = false;
        setTimeout(()=>{
          that.blinknextnavbtn = true;
          setTimeout(()=>{
            that.blinknextnavbtn = false;
          }, 400);
        }, 400);
      }, 400);
    }, 400);

  }

  blinkGoodBadBtn() {

    let that = this;

    setTimeout(()=>{
      that.blinkgoodbad = true;
      setTimeout(()=>{
        that.blinkgoodbad = false;
        setTimeout(()=>{
          that.blinkgoodbad = true;
          setTimeout(()=>{
            that.blinkgoodbad = false;
          }, 400);
        }, 400);
      }, 400);
    }, 400);

  }

  blinkRecBtn() {
    
    let that = this;

    setTimeout(()=>{
      that.blinkrec = true;
      setTimeout(()=>{
        that.blinkrec = false;
        setTimeout(()=>{
          that.blinkrec = true;
          setTimeout(()=>{
            that.blinkrec = false;
          }, 400);
        }, 400);
      }, 400);
    }, 400);

  }

  blinkPlayBtn(){
    
    let that = this;

    setTimeout(()=>{
      that.blinkplay = true;
      setTimeout(()=>{
        that.blinkplay = false;
        setTimeout(()=>{
          that.blinkplay = true;
          setTimeout(()=>{
            that.blinkplay = false;
          }, 400);
        }, 400);
      }, 400);
    }, 400);

  }
  
  blinkStartButton(){
    
    let that = this;
    let stbtn = this.el.nativeElement.querySelector('.main-app-start-btn');
    this.start_button_animation = setInterval(()=>{
     
        stbtn.classList.toggle('startbuttonhilight');
      
    }, 1200);
    

  }

  enter() {
    if(this.action_media_stop) this.playmedia.stop();
    //  Check cards and sent enter event to active card
    //  in case if any other component is hidden
    if(!this.show_grammar && !this.show_notebook && !this.show_testing){
      for(let i in this.ccs){
        let c = this.ccs[i];
        if(c.instance.isActive()){
          c.instance.enter(false); 
        }
      }
    } else {
      if(this.show_testing){
        this.sht.enter();
      }
      if(this.show_notebook){
        if(this.nb.isNotebook){
          this.show_notebook = false;
          if(!this.global_start){
            this.show_start_screen = true;
          }
        } else {
          this.nb.enter();
        }
        
      }
      if(this.show_grammar){
        //this.grm.enter();
      }
    }

  }

  repeat() {
    if(this.action_media_stop) this.playmedia.stop();
    if(this.lesson_finished) return;
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.repeat(); 
      }
    }

  }

  hint() {
    if(this.action_media_stop) this.playmedia.stop();
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.hint(); 
      }
    }
  }

  clear() {
    if(this.action_media_stop) this.playmedia.stop();
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.clear(); 
      }
    }
  }

  rule() {
    if(this.action_media_stop) this.playmedia.stop();
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.rule(); 
      }
    }
  }

  optionHide() {
    this.rui_button_hint = false;
    this.rui_button_clear = false;
    this.rui_button_rule = false;
    this.rui_button_goodbad = false;
    this.rui_button_prev = false;
    //this.rui_button_enter = false;
  }

  enterHide() {
    this.rui_button_enter = false;
  }

  //  Change option button from hint to clear
  showClear(){
    this.rui_button_hint = false;
    this.rui_button_clear = true;
    this.rui_button_goodbad = false;
    this.rui_button_prev = false;
    this.rui_button_rule = false;
  }

  //  Change option button from hint to clear
  showRule(){
    this.rui_button_hint = false;
    this.rui_button_clear = false;
    this.rui_button_goodbad = false;
    this.rui_button_prev = false;
    this.rui_button_rule = true;
  }

  //  Change option button from clear to hint
  showHint(){
    this.rui_button_hint = true;
    this.rui_button_clear = false;
    this.rui_button_goodbad = false;
    this.rui_button_prev = false;
    this.rui_button_rule = false;
  }

  //  Change option button to good/bad
  showGoodBad(){
    this.rui_button_hint = false;
    this.rui_button_clear = false;
    this.rui_button_goodbad = true;
    this.rui_button_prev = false;
    this.rui_button_rule = false;
  }

  //  Change option button to prev
  showPrev(){
    this.rui_button_hint = false;
    this.rui_button_clear = false;
    this.rui_button_goodbad = false;
    this.rui_button_prev = true;
    this.rui_button_rule = false;
  }

  //  Show enter button
  showEnter(){
    this.rui_button_enter = true;
  }

  setCurrentCardId(id) {
    this.current_id = id;
  }

  getChildCardScope(id) {
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.data.id === id) return c.instance;
    }
    return null;
  }


  resumeAudioContext() {

  }

  checkLessonComplete() {

    //  For this operation we simply go throughout all cards and their scopes and check validate function
    //  If all cards are valid, that means student performs all this cards and didn't skip any.
    //  In other case if student skiped any cards we will not finish the lesson and ask him to repeat.

    let valid = true;

    //  Disable completeness check, later will be added setting which will responsible for this state
    return true;

    //  get $$childHead first and then iterate that scope's $$nextSiblings
    //  until scope with required id will found
    //for(let cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
      //  Condition  for cdeck app card
    //  if(typeof cs.card_id !== 'undefined' && typeof cs.validate !== 'undefined' && !cs.validate()){
    //      valid = false;
    //      break;
    //    }
    //}

    //return valid;

  }

  finishLesson() {
    if(this.end_lesson_flag) return;
    this.end_lesson_flag = true;

    let that = this;

    //  Check if we are not in sidetrip mode
    if(this.checkLessonComplete()){
      if(!this.sidetripmode){
        this.logging.lessonEnd(this.student.lu)
          .subscribe(
            data => {},
            error => {
              console.log(error);
              this.notify.error('Logging End Command status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
            }
          );
      }
      this.el.nativeElement.querySelector('.main-app-finish-lesson-screen').style.display = 'block';
      setTimeout(function(){
        that.el.nativeElement.querySelector('.main-app-finish-lesson-screen').style.opacity = '1'; 
      }, 700);
      this.lesson_finished = true;
      this.global_header = '';
    } else {
      if(!this.sidetripmode){
        this.logging.lessonTimeon(this.student.lu)
          .subscribe(
            data => {},
            error => {
              console.log(error);
              this.notify.error('Lesson Timeon status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
            }
          );
      }
      this.repeat_url = window.location.href;
      this.el.nativeElement.querySelector('.lesson-not-complete-screen').style.display = 'block';
      setTimeout(function(){
        that.el.nativeElement.querySelector('.lesson-not-complete-screen').style.opacity = '1'; 
      }, 700);
    }
    this.playmedia.stop();
    this.global_desc = '';
    this.stopSnoozeTimer();
  }

  good() {
    if(this.action_media_stop) this.playmedia.stop();
    this.good_btn.emit();
  }

  bad() {
    if(this.action_media_stop) this.playmedia.stop();
    this.bad_btn.emit();
  }

  prev() {
    if(this.action_media_stop) this.playmedia.stop();
    this.prev_btn.emit();
  }

  onCloseMenu() {
    this.show_tool_pages_list = false;
  }

  onShowSettings() {
    this.show_setting_modal = true;
  }

  onShowFeedback() {
    this.show_feedback_modal = true;
  }

  onCloseSettings() {
    this.show_setting_modal = false;
  }

  onCloseFeedback() {
    this.show_feedback_modal = false;
  }

  showWarnComplete() {
    this.show_warncomplete_modal = true;
  }

  onCloseWarncomplete() {
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive() && typeof c.instance.onCloseWarnComplete !== 'undefined'){
        c.instance.onCloseWarnComplete();
      }
    }
    this.show_warncomplete_modal = false;
  }

  onGoNextCard() {
    this.onCloseWarncomplete();
    this.switchToNextCard();
  }

  onShowGrammar(){
    this.show_notebook = false;
    this.show_testing = false;
    this.show_grammar = !this.show_grammar;
    console.log("Show grammar.");
    let that= this;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
    if(this.mode === 'single') this.onCloseMenu();
    if(!this.global_start){
      if(this.show_grammar) this.show_start_screen = false;
      if(!this.show_grammar) this.show_start_screen = true;
    }
  }

  onShowNotebook(){
    console.log("Show Notebook.");
    this.show_grammar = false;
    this.show_testing = false;
    let that = this;
    this.show_notebook = !this.show_notebook;
    this.nb.lesson_num = this.student.lu;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
    if(this.mode === 'single') this.onCloseMenu();
    if(!this.global_start){
      if(this.show_notebook) this.show_start_screen = false;
      if(!this.show_notebook) this.show_start_screen = true;
    }
  }

  onCloseNotebook(){
    console.log("Close Notebook.");
    this.show_grammar = false;
    this.show_testing = false;
    let that = this;
    this.show_notebook = false;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
    if(this.mode === 'single') this.onCloseMenu();
    if(!this.global_start){
      if(this.show_notebook) this.show_start_screen = false;
      if(!this.show_notebook) this.show_start_screen = true;
    }
  }

  //  Show Testing
  onShowTesting() {
    this.show_notebook = false;
    this.show_grammar = false;
    this.show_testing = !this.show_testing;
    let that= this;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
    if(this.mode === 'single') this.onCloseMenu();
    if(!this.global_start){
      if(this.show_testing) this.show_start_screen = false;
      if(!this.show_testing) this.show_start_screen = true;
    }
  }

  onCloseTesting() {
    this.show_notebook = false;
    this.show_grammar = false;
    this.show_testing = false;
    let that= this;
    setTimeout(()=>{ that.scale = that.defineCurrentScale(); }, 10);
    if(this.mode === 'single') this.onCloseMenu();
    if(!this.global_start){
      if(this.show_testing) this.show_start_screen = false;
      if(!this.show_testing) this.show_start_screen = true;
    }
  }






  public rec_toggle: boolean = false;
  public rec_stoped: boolean = false;
  public rec_exists: boolean = false; //  Flag mark for existing any record, used to change rec button icon from mic to speaker
  public global_volume: number = 1;
  public show_rec_setting: boolean = false;
  public rec_play: boolean = false;

  //  Recorder methods
  //  Event handler for rec button
  recToggle() {
    let that = this;
    //  Check state, rec start or rec stop
    if(!this.rec_toggle){
      //  Change rec flag
      this.rec_toggle = true;
      this.rec_stoped = false;
      this.rec_exists = false;
      
      //  Start recording
      setTimeout(function(){ 
        that.recorder.start(); 
        that.recstart_event.emit();
      }, 600);
      
      if(typeof this.beep_start_sound !== 'undefined' && typeof this.beep_start_sound.play !== 'undefined') {
        this.beep_start_sound.volume(this.global_volume);
        this.beep_start_sound.play();
      }

    } else {
      //  Change rec flag
      this.rec_toggle = false;
      this.rec_stoped = true;
      this.rec_exists = true;
      
      //  Stop recording
      setTimeout(function(){ 
        that.recorder.stop(); 
        that.recstop_event.emit();
      }, 500);
    }
  }

  //  Max record time include waiting delay
  public max_rec_duration = 11000;
  //  Min record time include waiting delay
  public min_rec_duration = 3000;
  //  Rec interval instance
  public rec_start_interval = null;
  //  Delay before start
  public delay_before_rec_start = 140;
  //  Time of current record
  public rec_time = 0;
  //  Flag that represent record button state
  public rec_button_release = false;
  //  Waiting for audio context timer
  public waiting_audioctx_timer = null;

  startRecordingOfInitSample() {
    let that = this;
    //this.recToggle();
    this.rec_start_interval = setInterval(function() {
      that.rec_time += 20;
      if(!that.rec_toggle){
        that.recToggle();
      }
      //  Check if recording was started and it duration is more than allowed
      //  stop recording
      if(that.rec_time >= that.max_rec_duration){
        clearTimeout(that.rec_start_interval);
        that.rec_time = 0;
        if(that.rec_toggle) that.recToggle();
      }

      //  Check if rec button was released and minimal duration reached
      if(that.rec_time >= that.min_rec_duration && that.rec_button_release){
        clearTimeout(that.rec_start_interval);
        that.rec_time = 0;
        if(that.rec_toggle) that.recToggle();
      }

    }, 20);
  }

  recUp() {
    this.rec_button_release = true;
  } 

  recDown() {
    let that = this;
    this.rec_button_release = false;
    //  Intermediate function to check audio context and start recording
    let wait_audio_ctx_counter = 0;
    clearTimeout(that.waiting_audioctx_timer);
    let waitForAudioContext = function() {
      if(!that.recorder.audio_context_enable) {
        if(wait_audio_ctx_counter > 10){
          alert(that.translate.instant('mic_disabled_msg'));
          that.global_recorder = false;
          that.setGlobalRecorder(that.global_recorder);
          return;
        } else {
          that.waiting_audioctx_timer = setTimeout(waitForAudioContext, 150);
          wait_audio_ctx_counter++;
          return;
        }
        
      } else {
        that.global_recorder = true;
        setTimeout(()=>{ that.setGlobalRecorder(that.global_recorder); }, 100);
        that.startRecordingOfInitSample();
      }
    }
    
    if(!this.recorder.audio_context_enable) {
      
      //  Enable audio context
      this.recorder.init();
      waitForAudioContext();
      return;

    }
    clearTimeout(this.rec_start_interval);

    this.startRecordingOfInitSample();

  }


  /*
  //  Handler for mouseup rec button event
  recUp() {
    
    //if(!this.global_start || !this.recorder.audio_context_enable) return;
    if(!this.recorder.audio_context_enable) return;
    clearTimeout(this.rec_start_interval);
    //  If recording was started, stop it
    if(this.rec_toggle){
      this.recToggle();
      this.rec_time = 0;
      return;
    }
    //  If rec time is less than delay before start rec, then play last record
    if(this.rec_time <= this.delay_before_rec_start && this.rec_time > 0){
      this.rec_play = true;
      this.rec_stoped = false;
      //this.rec_time = 0;
      //this.playStart();
    }
    //  Clear rec time
    this.rec_time = 0;
  }

  //  Handler for mousedown rec button event
  recDown() {
    if(this.action_media_stop) this.playmedia.stop();
    if(!this.recorder.recorder_init_ready) this.recorder.init();
    //if(!this.global_start || !this.recorder.audio_context_enable) return
    if(!this.recorder.audio_context_enable) return
    //  if play in progress or setting page is shown, return
    if(this.show_rec_setting) return;
    if(this.rec_play) this.playStop();
    let that = this;
    clearTimeout(this.rec_start_interval);
    that.rec_time += 10;
    //  Start intervel which will measure time of button pressed state
    //  and depends on conditions start play last audio or start rec new
    this.rec_start_interval = setInterval(function() {
      that.rec_time += 20;
      if(that.rec_time > that.delay_before_rec_start && !that.rec_toggle){
        that.recToggle();
      }
      //  Check if recording was started and it duration is more than allowed
      //  stop recording
      if(that.rec_time >= that.max_rec_duration){
        clearTimeout(that.rec_start_interval);
        that.rec_time = 0;
        if(that.rec_toggle) that.recToggle();
      }
    }, 20);
  }
  */

  setNoRecordItem() {
    //alert("You have no recordings yet!");
    this.global_desc = this.translate.instant('no_recording_msg');
    if(typeof this.yhnry_sound !== 'undefined' && typeof this.yhnry_sound.play !== 'undefined') {
      this.yhnry_sound.stop();
      this.yhnry_sound.volume(this.global_volume);
      this.yhnry_sound.play();
    }
  }

  //  Event handler for start play button
  playStart() {
    if(this.action_media_stop) this.playmedia.stop();
    //if(!this.global_start || !this.recorder.audio_context_enable) return;
    if(!this.recorder.audio_context_enable){
      this.setNoRecordItem(); return;
    }
    let that = this;
    that.playstart_event.emit();

    //  Check if there is no any record yet
    if(!this.recorder.lastrec) {
      this.setNoRecordItem();
    }

    // Stop recording
    clearTimeout(that.rec_start_interval);
    that.rec_time = 0;
    if(that.rec_toggle) {
      that.recToggle();
      return;
    }

    //  Start play audio and set callback when playing will finished
    this.recorder.playStart(function() {
      that.rec_play = false;
      that.rec_stoped = true;
      
      that.playstop_event.emit();
    });
  };

  playStop() {
    if(!this.global_start || !this.recorder.audio_context_enable) return;
    let that = this;
    //  Stop play audio
    this.recorder.playStop();
    that.rec_play = false;
    that.rec_stoped = true;
    that.playstop_event.emit();
  }

  disableSidetrip() {
    this.end_lesson_flag = true;
    this.router.navigateByUrl('/home');
  }

  startSnoozeTimer() {
    let that = this;
    this.snooze_timer = setInterval(function(){
      that.snooze_time++;
      if(that.snooze_time >= that.snooze_delay){
        that.goToSnooze();
        clearTimeout(that.snooze_timer);
      } 
      //else console.log("Snooze time: " + that.snooze_time);
    }, 1000);
  }

  stopSnoozeTimer() {
    this.snooze_time = 0;
    clearTimeout(this.snooze_timer);
  }

  continueLesson() {
    //  Hide Snooze message
    this.show_snooze = false;
    this.startSnoozeTimer();

    //  Send activity log begin Lesson message
    if(!this.sidetripmode){
      this.logging.lessonBegin(this.student.lu)
        .subscribe(
          data => {},
          error => {
            console.log(error);
            this.notify.error('Lesson Begin status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
          }
        );
      
      let sc = this.getChildCardScope(this.current_id);
      if(typeof sc !== 'undefined' && sc !== null && typeof sc.render !== 'undefined'){
        sc.card_begin_flag = false;
        sc.render();
      }
    }



  }

  resetSnoozeTime() {
    this.snooze_time = 0;
  }

  goToSnooze() {
    //  Show snooze message
    this.show_snooze = true;
    this.snooze_time = 0;
    this.urgentLeaveLesson();
    clearTimeout(this.snooze_timer);
  }


}
