import { Component, OnInit, HostListener, ViewChild, ComponentFactoryResolver, AfterViewInit, ViewEncapsulation, ElementRef, OnDestroy, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { CardDirective } from '../../directives/card.directive';
import { CardItem } from '../../card-item';
import { CardComponent } from '../card/card.component';
import { Howl, Howler } from 'howler';
import * as $ from 'jquery';

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
  public mode = 'dual';
  public cpos: number = 2;
  public scale: number = 0.9;
  //  Special scale for slide mode
  public slide_scale = 0.96;

  @ViewChild(CardDirective) appCard: CardDirective;

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

  public rui_button_hint: boolean = false;
  public rui_button_clear: boolean = false;
  public rui_button_goodbad: boolean = false;
  public page_is_loading_screen: boolean = true;
  public main_app_screen: boolean = false;
  public beep_start_sound: any;
  public global_recorder: boolean = false;
  public end_lesson_flag: boolean = false;
  public recstart_event: EventEmitter<any> = new EventEmitter();
  public recstop_event: EventEmitter<any> = new EventEmitter();
  public playstart_event: EventEmitter<any> = new EventEmitter();
  public playstop_event: EventEmitter<any> = new EventEmitter();
  public good_btn: EventEmitter<any> = new EventEmitter();
  public bad_btn: EventEmitter<any> = new EventEmitter();

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
    private cs: ColorschemeService
  ) {
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(Option.getFallbackLocale());

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(Option.getLocale());
  }

  ngOnInit() {

    //  Init studetn information
    this.DL.getStudentInfo().subscribe(
        data => this.handleStudentInfo(data),
        error => {
          console.log(error);
          this.notify.error('Student info load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
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

    this.cs.onChange().subscribe(()=>{
      console.log('Change color scheme event.');
      if(this.global_start) this.refreshLesson();
    });

    this.Option.change_language_event.subscribe(()=>{
      console.log('Change language event.');
      this.translate.use(this.Option.getLocale());
    })

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    setTimeout(()=>{ that.refreshNav(); }, 100);
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
    if(!this.end_lesson_flag){
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
        let dialogText = 'Do you want to leave this lesson?';
        event.returnValue = dialogText;
        return dialogText;
      }
  }

  //  Handle keydown events
  @HostListener('window:keydown', ['$event'])
  onKeydow(event) {
      if(event.keyCode == 37) this.movePrev();
      if(event.keyCode == 39) this.moveNext();
      if(event.keyCode == 13) this.enter();
  }

  getCurrentLessonTitle(lu){
    
        let n:string = String(lu);
        n = n.length === 3 ? n : n.length === 2 ? '0' + n : n.length === 1 ? '00' + n : n;
        return n;
     
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
    this.playmedia.setRate(0.8 + (parseInt(data.options.expertlevel)*0.04));
    this.cs.setScheme(+data.options.screencolor);
    this.Option.setLanguage(data.options.language);

    //  Check if start position is setted
    if(typeof data.start !== 'undefined' && !this.sidetripmode) this.start_position = data.start;
    
    //  Start loading cards according to last uncomplete lesson
    if(!this.sidetripmode){
      this.loadCards(this.student.lu);
      this.current_lesson_title = this.getCurrentLessonTitle(this.student.lu);
      console.log('Run normally, start position setted to '+this.start_position+'!');
    } else {
      this.loadCards(this.n);
      this.current_lesson_title = this.getCurrentLessonTitle(this.n);
      this.start_position = 0;
      console.log('Run sidetrip, start position setted to start!');
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
      
      (<CardComponent>componentRef.instance).mnext.subscribe(function(){
        that.moveNext();
      });
   
      (<CardComponent>componentRef.instance).mprev.subscribe(function(){
        that.movePrev(); 
      });

      (<CardComponent>componentRef.instance).blinkenter.subscribe(function(){
        that.blinkEnter(); 
      });

      (<CardComponent>componentRef.instance).blinknextnavbtn.subscribe(function(){
        that.blinkNextNavBtn(); 
      });

      (<CardComponent>componentRef.instance).default_waves = this.default_waves;

      (<CardComponent>componentRef.instance).option_hide.subscribe(function(){
        that.optionHide(); 
      });

      (<CardComponent>componentRef.instance).show_good_bad.subscribe(function(){
        that.showGoodBad(); 
      });

      (<CardComponent>componentRef.instance).show_hint.subscribe(function(){
        that.showHint(); 
      });

      (<CardComponent>componentRef.instance).show_clear.subscribe(function(){
        that.showClear();
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

      //this.updateLesson();
  }

  startLesson() {
    this.show_start_screen = false;
    let that = this;
    if(!this.recorder.recorder_init_ready) this.recorder.init();
    function enableLesson(){
        that.global_start = true;
        that.setGlobalStart(true);
        //that.global_recorder = that.recorder.audio_context_enable;
        //that.setGlobalRecorder(that.global_recorder);
        that.playmedia.setVolume(that.global_volume);
        
        that.beep_start_sound = new Howl({
              src: 'beep.mp3',
              autoplay: false,
              loop: false,
              volume: 0.7,
              rate: 1.8
            });

        that.updateLesson();

      }

      let wait_audio_ctx_counter = 0;
      let waitForAudioContext = function() {
        if(!that.recorder.audio_context_enable) {
          if(wait_audio_ctx_counter > 50){
            alert('Please enable microphone or check if your browser support it and reload the lesson!');
            that.global_recorder = false;
            that.setGlobalRecorder(that.global_recorder);
            enableLesson();
            return;
          } else {
            setTimeout(waitForAudioContext, 100);
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
    let zb = this.el.nativeElement.querySelector('.zoom-card-body');
    if(zb === null) return 1;
    let z = zb.clientWidth*this.slide_scale;

    
    //  Default double cards width
    let cbi = this.el.nativeElement.querySelector('.card-block-item');
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
    if(!this.global_start){
      this.startLesson();
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
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.complete !== 'undefined' && sc.complete < 100 && !this.sidetripmode){
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
    this.preloader.loadCard(this.cpos);
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

  enter() {

    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.enter(false); 
      }
    }

  }

  repeat() {

    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.repeat(); 
      }
    }

  }

  hint() {
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.hint(); 
      }
    }
  }

  clear() {
    //  Check cards and sent enter event to active card
    for(let i in this.ccs){
      let c = this.ccs[i];
      if(c.instance.isActive()){
        c.instance.clear(); 
      }
    }
  }

  optionHide() {
    this.rui_button_hint = false;
    this.rui_button_clear = false;
    this.rui_button_goodbad = false;
  }

  //  Change option button from hint to clear
  showClear(){
    this.rui_button_hint = false;
    this.rui_button_clear = true;
    this.rui_button_goodbad = false;
  }

  //  Change option button from clear to hint
  showHint(){
    this.rui_button_hint = true;
    this.rui_button_clear = false;
    this.rui_button_goodbad = false;
    
  }

  //  Change option button to good/bad
  showGoodBad(){
    this.rui_button_hint = false;
    this.rui_button_clear = false;
    this.rui_button_goodbad = true;
    
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
  }

  good() {
    this.good_btn.emit();
  }

  bad() {
    this.bad_btn.emit();
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
    this.show_warncomplete_modal = false;
  }

  onGoNextCard() {
    this.onCloseWarncomplete();
    this.switchToNextCard();
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
      
      if(typeof this.beep_start_sound.play !== 'undefined') {
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
  //  Rec interval instance
  public rec_start_interval = null;
  //  Delay before start
  public delay_before_rec_start = 140;
  //  Time of current record
  public rec_time = 0;
  
  //  Handler for mouseup rec button event
  recUp() {
    
    if(!this.global_start || !this.recorder.audio_context_enable) return;
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
    if(!this.global_start || !this.recorder.audio_context_enable) return
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

  //  Event handler for start play button
  playStart() {
    if(!this.global_start || !this.recorder.audio_context_enable) return;
    let that = this;
    that.playstart_event.emit();
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


}
