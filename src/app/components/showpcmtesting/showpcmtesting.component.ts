import { Component, OnInit, Input, Output, ViewChild, ComponentFactoryResolver, AfterViewInit, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { TestComponent } from '../test/test.component';
import { TestDirective } from '../../directives/test.directive';
import { DataloaderService } from '../../services/dataloader.service';
import { TestbuilderService } from '../../services/testbuilder.service';
import { LoggingService } from '../../services/logging.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { MediapreloaderService } from 'src/app/services/mediapreloader.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { CustomfieldService } from '../../services/customfield.service';
import { PlaymediaService } from '../../services/playmedia.service';
import { PickElementService } from '../../services/pick-element.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-showpcmtesting',
  templateUrl: './showpcmtesting.component.html',
  styleUrls: ['./showpcmtesting.component.scss'],
  host: {'class': 'testing-wrapper-slide'},
})
export class ShowpcmtestingComponent implements OnInit, AfterViewInit {

  public _show: any;
  public _scale: number;
  public layout: any;
  public tstdata: any;
  public cts: any;
  public ctestpos: number = 0;
  public max: number = 0;
  public min: number = 0;
  //  Positions for progress calc with including info about custom fields
  public pg_max: number = 0;
  public pg_min: number = 0;

  public global_header = "";
  public global_desc = "";

  public test_results: any = [];
  public test_started: boolean = false;
  public test_log_sent = false;
  public uinputph = 'teststart';
  public complete = 0;
  public mode = 'dual';
  public options: any = null;
  public locales: any = null;
  public breaks = [];
  public current_break = 0;
  public end_position;
  public logid: any = 0;
  public levels_screen: boolean = false;
  public show_next: boolean = true;
  public show_prev: boolean = false;
  public show_results: boolean = false;
  public rrrequest_sent = false;
  public rrrequest_start = false;
  public u_email = '';
  public u_name = 'none';
  public test_description = 'Test';
  public default_test_description = 'Test';
  public practice_show: boolean = true;
  public practice_mode: boolean = false;
  public card_descriptor = {
    lesson: 0,
    position: 0,
    activity: ''
  }
  //  Sent Feedback List according to current card descriptor
  public current_feedback_list: any = [];
  public show_feedback_modal: boolean = false;
  public blinknextnavbtn: boolean = false;
  public blinkprevnavbtn: boolean = false;
  public blinkcompletenavbtn: boolean = false;

  @Output() closetesting = new EventEmitter<boolean>();
  @Input('show')
  set show(show: boolean) {
    this.showPage(show);
  }
  @Input('scale')
  set scsale(scale: number) {
    this._scale = scale;
    this.calcScsale();
  }

  showPage(show = true) {
    this._show = show;
    
    if(!show){
      //this.saveTestResultsToLog();
      this.tstdata = null;
      this.layout = {
        'transform': 'scale('+this._scale+', '+this._scale+')',
        'opacity': 0
      }
      this.complete = 0;
      this.uinputph = 'teststart';
      this.ctestpos = 0;
      
    }
    else {
      let that = this;
      this.test_log_sent = false;

      //  Check user status, if registered or has email
      if(this.tn.getEmail() == 'none' || this.tn.getEmail() == "" || this.tn.getEmail() == null || this.tn.getEmail() == 'null' || this.tn.getEmail() == 'undefined'){ 
        this.router.navigateByUrl("/home");
        return;
      }

      setTimeout(()=>{
        that.getTest();
      }, 1500);
      this.updateLayout();
    }
  }

  @ViewChild(TestDirective) appTest: TestDirective;

  constructor(
      private dl: DataloaderService,
      private tb: TestbuilderService,
      private componentFactoryResolver: ComponentFactoryResolver,
      private logging: LoggingService,
      private el: ElementRef,
      private translate: TranslateService,
      private Auth: AuthService,
      private pr: MediapreloaderService,
      public tn: TokenService,
      private router: Router,
      public cf: CustomfieldService,
      public playmedia: PlaymediaService,
      public pe: PickElementService,
      public title: Title
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(window.navigator.language.substr(0, 2));
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calcScsale();
  }

  ngOnInit() {
    let that = this;
  	this.Auth.authStatus.subscribe(value => { 
      if(value){
        this.dl.getStudentInfo().subscribe((data)=>{
          that.options = (data as any).options;
          that.setUserLanguage();
        });
      }
    });
    this.dl.getLocales().subscribe(value => {
      console.log("current app locales:  ");
      console.log(value);
      that.locales = value;
      that.setUserLanguage();
    });
    //let locale = window.navigator.language.substr(0, 2);
    //setTimeout(()=>{ this.translate.use(locale); }, 100);
    this.calcScsale();
    this.showPage();
    //  Set lessons title
    this.title.setTitle('LTK-Testing');
  }

  ngAfterViewInit() {

  }

  setUserLanguage() {
    if(this.options === null || this.locales === null) return;
    //  Get current user locale
    let l = 'en';
    for(let i in this.locales){
      if(this.locales[i].lang === this.options.language) l = this.locales[i].locale;
    }
    this.translate.use(l);
  }

  calcScsale() {
    //  Calc initial scale to fit card on the page
    //  Take width of 90% available card space
    //let zb = this.el.nativeElement.parentNode.parentElement;
    let zb = this.el.nativeElement.querySelector('.testing-wrap');
    if(zb === null){
      this._scale = 1;
      this.updateLayout();
      return;
    }
    let z = zb.clientWidth;

    
    //  Default double cards width
    //  Container element
    let cbi = null;
    this.el.nativeElement.querySelectorAll('.testing-container').forEach((e)=>{
      if(e.clientWidth !== 0 && e.clientHeight !== 0) cbi = e;
    });
    if(cbi === null){
      this._scale = 1;
      this.updateLayout();
      return;
    }
    let c = cbi.clientWidth;
    if(this.mode === 'single') {
      c = 400;
    }
      
    if((z/c * cbi.clientHeight) > zb.clientHeight){
      z = zb.clientHeight;
      c = cbi.clientHeight;
    }
    

    let scale = z/c;
    if(scale > 2.4) scale = 2.4;
    //return scale;
    this._scale = scale*0.98;
    this.updateLayout();
  }

  //  Load test
  async getTest() {
    let data: any = null;
    if((!this.tn.getProf() || this.tn.getProf() === "") && (!this.tn.getType() || this.tn.getType() === "")) 
      data = await this.dl.getPlacement();
    else if((!this.tn.getProf() || this.tn.getProf() === "") && this.tn.getType() && this.tn.getType() !== "") 
      data = await this.dl.getTypedTest(this.tn.getType());
    else data = await this.dl.getProfPlacement(this.tn.getProf());
    console.log(data);
    this.logid = +(data as any).logid;
    this.dl.setLogId(this.logid);

    this.card_descriptor.lesson = (data as any).test.id;
    

    //  If email is not defined (it happens for registered users)
    if(typeof data.email !== 'undefined' && data.email !== "") this.tn.setEmail(data.email);

    //  Set test description
    if(typeof data.test !== 'undefined' && typeof data.test.desc !== 'undefined' && data.test.desc && data.test.desc !== "") {
      this.test_description = data.test.desc;
      this.default_test_description = data.test.desc;
      this.title.setTitle('LTK-Testing-' + data.test.title);
    }

    let td = [];

    //  Split out breaks and test information
    //  Put breaks info with positions to tb service
    for(let k in (data as any).data) {
      let test_item = (data as any).data[k];
      td.push(test_item);
    }

    //  Set position for progress calc, max
    this.pg_max = td.length;

    //  Check for custom fields
    if(typeof data.custom_fields !== 'undefined') this.cf.setFields(data.custom_fields);
    //  Check for start and end custom fields in lesson
    if(this.cf.has_start_lesson) {
      this.cf.addStartCardToTest(td, this.ctestpos);
      //  Shift start position for progress calc
      this.pg_min++;
    }
    if(this.cf.has_end_lesson) this.cf.addEndCardToTest(td);

    //  Add intro and result screen

    //  Add intro
    let itr_screen = {
      content: {},
      description: "",
      pos: 0,
      position: 0,
      type: "intro",
      custom_field: ''
    };
    //  Shift start position for progress calc
    this.pg_min++;
    if(this.cf.has_start_screen) itr_screen.custom_field = this.cf.getStartScreen();
    td.unshift(itr_screen);
    this.test_results = this.tb.getResultsInst(td);

    //  Add finish
    let end_screen = {
      content: {results: this.test_results},
      description: "",
      pos: td.length,
      position: td.length,
      type: "results",
      custom_field: ''
    }
    if(this.cf.has_end_screen) end_screen.custom_field = this.cf.getEndScreen();
    td.push(end_screen);

    //  For placement test add additional screen that shows assigned level and lesson
    //  Add finish
    if(data.level_screen) {
      this.levels_screen = true;
      let level_screen = {
        content: {results: this.test_results},
        description: "",
        pos: td.length,
        position: td.length,
        type: "resultspcm",
        custom_field: ''
      }
      if(this.cf.has_end_screen) level_screen.custom_field = this.cf.getEndScreen();
      td.push(level_screen);
    }

    this.tb.end_position = td.length - 1;
    this.end_position = td.length - 1;

    console.log('----------   Testing data   -------------');
    console.log(td);
    //this.pr.setData(td);
    //this.pr.loadCard(this.ctestpos);
    this.tstdata = td;
    this.max = this.tstdata.length - 1;
    let cards = this.tb.getTests(td);
    let that = this;
    this.cts = [];

    let viewContainerRef = this.appTest.viewContainerRef;
    viewContainerRef.clear();

    for(let i = cards.length-1; i >= 0; i--){
      let card = cards[i];
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(card.component);

      let componentRef = viewContainerRef.createComponent(componentFactory);
      //  Link card data
      (<TestComponent>componentRef.instance).data = card.data;
      //  Link test type and inst
      (<TestComponent>componentRef.instance).inst = data.test.type;
      //  Link move next event
      (<TestComponent>componentRef.instance).mnext.subscribe(function(){
        that.mvNext();
      });
      //  Link move prev event
      (<TestComponent>componentRef.instance).mprev.subscribe(function(){
        that.mvPrev(); 
      });
      //  Link global header
      (<TestComponent>componentRef.instance).set_global_header.subscribe(function(e){
        that.global_header = e;
      });
      //  Link global description
      (<TestComponent>componentRef.instance).set_global_desc.subscribe(function(e){
        that.global_desc = e;
      });
      //  Link save results action to current results instance
      //(<TestComponent>componentRef.instance).save_results.subscribe(function(e){
      //  that.tb.addResult(e.type, e.presented, e.wrong, e.results, that.test_results[that.current_break]);
      //});
      //this.le.ccs.push(componentRef);
      if(card.data.type === 'resultspcm') {
        //  Link global header
        (<TestComponent>componentRef.instance).request_complete.subscribe(function(e){
          that.sendCorrectRegisterRequest();
        });
      }
      //  Set subtitles
      (<TestComponent>componentRef.instance).set_subtitles.subscribe(function(e){
        that.test_description = e;
      });
      this.cts.push(componentRef);
    }

    setTimeout(()=>{ that.updateTests(); that.setCurrentCardDescriptor(); }, 20);
    setTimeout(()=>{ that.blinkNextNavBtn(); }, 1600);
  }


  //  Update test layout
  updateLayout(){

    if(this._show){
      this.layout = {
        'transform': 'scale('+this._scale+', '+this._scale+')',
        'opacity': 1
      }
    } else {
      this.layout = {
        'transform': 'scale('+this._scale+', '+this._scale+')',
        'opacity': 0
      }
    }

  }

  //  Update tests
  updateTests() {
    this.setCurrentTestPosition(this.ctestpos);
    if(this.ctestpos <= this.max){
      
      for(let i in this.cts){
        let c = this.cts[i];
        if(c.instance.isActive() && typeof c.instance.getTestResult !== 'undefined'){
          
          //  Check if it is needed to show next for current instance
          if(typeof c.instance.show_next !== 'undefined' && c.instance.show_next) this.show_next = true;
          else this.show_next = false;

        }
      
      }
    }

    //  Show prev button for placement test results last screen
    if(this.end_position === this.ctestpos && this.levels_screen) {
      let that = this;
      this.show_prev = true;
      setTimeout(()=>{ that.blinkCompleteNavBtn(); }, 1000);
    }
    else this.show_prev = false;

  }

  //  Move next event
  mvNext(){
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    //  Check limit
    if(this.ctestpos < this.max){
      
      for(let i in this.cts){
        let c = this.cts[i];
        if(c.instance.isActive() && typeof c.instance.getTestResult !== 'undefined'){
          let r = c.instance.getTestResult();
          if(r) this.tb.addResult(r);
          c.instance.pm.stop();

        }
      }
      
      this.ctestpos = this.tb.getNextPosition(this.ctestpos);
      //this.current_break = this.tb.getCurrentBreak(this.ctestpos);

      //  Hide practice mode button in case when mode was not enabled
      this.practice_show = false;

      //  If last card (finish) shows, get user level info and load it to finish card instance
      if(this.end_position === this.ctestpos || ((this.end_position - 1) === this.ctestpos && this.levels_screen)){
        for(let i in this.cts){
          let c = this.cts[i];
          if(typeof c.instance.complete_level !== 'undefined' && this.levels_screen){
            this.test_results = c.instance.card.content.results = this.tb.combineResults();
            c.instance.complete_level = this.tb.getLevelByResults(c.instance.card.content.results);
            
            //  Show message for practice mode
            if(typeof c.instance.practice_mode !== 'undefined') c.instance.practice_mode = this.practice_mode;
            if(typeof c.instance.rrrequest_sent !== 'undefined') c.instance.rrrequest_sent = this.rrrequest_sent;

            if(this.end_position === this.ctestpos) {
              this.show_results = true;
              if(!this.practice_mode){
                this.logging.placementEnd(this.test_results, this.logid, c.instance.complete_level.level, c.instance.complete_level.break, c.instance.complete_level.lesson).then(e=>{ console.log(e); });
                console.log("Defined level:");
                console.log(c.instance.complete_level);
                console.log("Test results details:");
                console.log(this.test_results);
              } else {
                console.log("Test was taken in practice mode, results not saved!", this.test_results);
              }
            }
            
          }
          else if(c.instance.data.type === 'results'){
            if(this.levels_screen) {
              c.instance.enableContinue();
              c.instance.show_next = true;
              let that = this;
              setTimeout(()=>{ that.blinkNextNavBtn(); }, 1000);
            } else {
              this.show_results = true;
            }
            c.instance.card.content.results = this.test_results = this.tb.combineResults();
            console.log("Test results details prepared!", c.instance.card.content.results);
            this.saveTestResultsToLog();
          }

          //  Set default test description
          this.test_description = this.default_test_description;

        }
        
      }
      
      

      //  Calc completeness
      //this.complete = Math.round((this.ctestpos / (this.max - 1)) * 100);
      if(this.ctestpos < this.pg_min) this.complete = 0;
      else if(this.ctestpos >= this.pg_max) this.complete = 100;
      else {
        this.complete = Math.round(((this.ctestpos - this.pg_min) / this.pg_max) * 100);
      }
      //this.pr.loadCard(this.ctestpos);
      this.updateTests();
    } else {
      this.uinputph = 'finish';
      this.complete = 100;
      this.close();
    }

    this.setCurrentCardDescriptor();

  }

  //  Move prev event
  mvPrev(){
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    //  Check limit
    if(this.ctestpos > this.min){
      this.ctestpos--;
      this.updateTests();
    }
    this.setCurrentCardDescriptor();
  }

  setCurrentTestPosition(pos) {
    for(let i in this.cts){
      let c = this.cts[i];
      c.instance.cpos = pos;
    }
  }

  enter() {
    console.log('Showtesting enter handler.');
    for(let i in this.cts){
      let c = this.cts[i];
      if(c.instance.isActive()){
        c.instance.enter(false); 
      }
    }
  }

  close(){
		this._show = false;
		//this.saveTestResultsToLog();
  }
  
  saveTestResultsToLog() {
    
    if(!this.test_log_sent) {
      if(!this.practice_mode){
        this.test_log_sent = true;
        this.logging.testEnd('TST', 0, this.test_results, this.ctestpos, this.dl.lu, this.complete)
          .subscribe(
            data => { console.log('Testing >>>>>>>>>>  Test Results Saved!'); console.log(data); },
            error => {
              console.log(error);
              alert('Logging End Test status: ' + error.status + ' ' + error.statusText);
            }
          );
      } 
      //this.clearResults();
    }
  }

  clearResults() {
    this.tb.clearResults(this.test_results);
  }

  getPlacementResultInstance() {
    
    //  Get corrected data from pcm result instance
    let pcm_inst = null;
    for(let i in this.cts){
      let c = this.cts[i];
      if(c.instance.isActive() && typeof c.instance.getTestResult !== 'undefined' && typeof c.instance.rrrequest_sent !== 'undefined'){
        pcm_inst = c.instance;
      }
    }

    return pcm_inst;
  }

  sendRegisterRequest() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    let that = this;
    this.rrrequest_start = true;
    let pcm_inst = this.getPlacementResultInstance();
    this.dl.sendRegisterRequest(this.tn.getEmail()).then((e)=>{
      that.rrrequest_sent = true;
      if(pcm_inst) pcm_inst.rrrequest_sent = true;
    });
  }

  sendCorrectRegisterRequest() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    let that = this;
    this.rrrequest_start = true;
    
    let pcm_inst = this.getPlacementResultInstance();
    if(pcm_inst) {
      if(pcm_inst.u_email !== '') this.u_email = pcm_inst.u_email;
      if(pcm_inst.u_name !== '') this.u_name = pcm_inst.u_name;
    }

    this.dl.sendRegisterRequest(this.u_email, this.u_name).then((e)=>{
      that.rrrequest_sent = true;
      if(pcm_inst) pcm_inst.rrrequest_sent = true;
    });
  }

  enablePractice() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.practice_mode = true;
    this.mvNext();
  }
  disablePractice() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.reloadTest();
    //this.practice_mode = false;
  }

  reloadTest() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.playmedia.stop();
    this.tb.deleteResults();
    this.router.navigateByUrl('/home', {skipLocationChange: true})
      .then(() => this.router.navigate(['/test']));
  }

  goBack() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.playmedia.stop();
    this.tb.deleteResults();
    this.router.navigateByUrl('/home');
  }

  getCardDescriptor() {
    let that = this;
    let d = '#'+this.card_descriptor.lesson+'-'+this.card_descriptor.position+':'+this.card_descriptor.activity;
    //  Check if feedback already exist for current card
    this.dl.getLastFeedbacks(encodeURIComponent('N'+this.card_descriptor.lesson+'-'+this.card_descriptor.position+'-'+this.card_descriptor.activity)).then((data)=>{
      if(typeof (data as any).length !== 'undefined' && (data as any).length > 0){
        console.log("Found feedback according to current card");
        console.log(data);
        that.current_feedback_list = data;
      } else {
        that.current_feedback_list = [];
      }
    });
    return d;
  }

  setCurrentCardDescriptor() {
    let that = this;
    for(let i in this.cts){
      let c = this.cts[i];
      if(c.instance.isActive()){
        let r = c.instance.getTestResult();
        that.card_descriptor.position = that.ctestpos;
        if(typeof c.instance.card !== 'undefined') that.card_descriptor.activity = c.instance.card.id;
      }
    }
    
    //  Store updated descriptor to DataLoader service to share it between other components
    that.dl.card_descriptor = that.getCardDescriptor();

  }

  
  onShowFeedback() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.playmedia.stop();
    this.show_feedback_modal = true;
  }

  onCloseFeedback() {
    this.show_feedback_modal = false;
  }

  blinkNextNavBtn() {

    let that = this;

    setTimeout(()=>{
      that.blinknextnavbtn = true;
      setTimeout(()=>{
        that.blinknextnavbtn = false;
        setTimeout(()=>{
          that.blinknextnavbtn = true;
          setTimeout(()=>{
            that.blinknextnavbtn = false;
          }, 600);
        }, 600);
      }, 600);
    }, 600);

  }

  blinkCompleteNavBtn() {

    let that = this;

    setTimeout(()=>{
      that.blinkcompletenavbtn = true;
      setTimeout(()=>{
        that.blinkcompletenavbtn = false;
        setTimeout(()=>{
          that.blinkcompletenavbtn = true;
          setTimeout(()=>{
            that.blinkcompletenavbtn = false;
          }, 600);
        }, 600);
      }, 600);
    }, 600);

  }


}
