import { Component, OnInit, Input, ElementRef, ComponentFactoryResolver, ViewChild} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { TestComponent } from '../../components/test/test.component';
import { TestDirective } from '../../directives/test.directive';
import { DataloaderService } from '../../services/dataloader.service';
import { TestbuilderService } from '../../services/testbuilder.service';

@Component({
  selector: 'app-tst',
  templateUrl: './tst.component.html',
  styleUrls: ['./tst.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class TstComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, 
              private sanitizer: DomSanitizer, 
              private playmedia: PlaymediaService, 
              private tstlog: LoggingService, 
              private tstcs: ColorschemeService,
              private dl: DataloaderService,
              private tb: TestbuilderService,
              private componentFactoryResolver: ComponentFactoryResolver,) {
  	super(elm, sanitizer, playmedia, tstlog, tstcs);
  }

  public uinputph = 'teststart';
  public _show: any;
  public layout: any;
  public tstdata: any;
  public cts: any;
  public ctestpos: number = 0;
  public max: number = 0;
  public min: number = 0;
  public test_results: any = [];

  public global_header = "";
  public global_desc = "";
  public test_started: boolean = false;
  public test_log_sent = false;

  @ViewChild(TestDirective) appTest: TestDirective;

  ngOnInit() {
  	this.setHeader();
    this.card = this.data;
    this.activity_log_sent = true;
  }

  //	Validation of user input
  validate() {
    if(this.uinputph === 'finish')
    return true;
    else return false;
  }

  //	Prevent performing of show function twice in some cases
  public prevent_dubling_flag: boolean = false;

  //	Callback for show card event
  show() {
    //	If card is active and it is not dubling
    if(this.isActive() && !this.prevent_dubling_flag){
      //	If user not enter valid data yet
      if(!this.validate()) {
        
        //	Play card description
        //this.playCardDescription();
        this.disableMoveNext();

        let that = this;
        if(!this.test_started){
          setTimeout(()=>{
            that.getTest();
          }, 1500);
        }
        this.updateLayout();
        this.activity_log_sent = true;
        this.test_log_sent = false;
        this.ctestpos = 0;
        this.complete = 0;
        this.uinputph = 'teststart';
        this.updateTests();
      } else {
        this.enableMoveNext();
      }
      this.prevent_dubling_flag = true;
    }
    
  }

  hide() {
    this.prevent_dubling_flag = false;
    //	Hide option buttons
    this.optionHide();
  }

  //	Used to play task word and sound exactly after instructions play finished
  playContentDescription() {
    
  }

  clearResults() {
    this.tb.clearResults(this.test_results);
  }
  
  //  Load test
  async getTest() {
    let data = await this.dl.getTest();

    //  Add intro and result screen
    let td = [];
    for(let k in data) td.push(data[k]);
    td.unshift({
      content: {},
      description: "",
      pos: 0,
      position: 0,
      type: "intro"
    });
    this.test_results = this.tb.getResultsInst(td);
    td.push({
      content: {results: this.test_results},
      description: "",
      pos: td.length,
      position: td.length,
      type: "results"
    });

    console.log('----------   Testing data   -------------');
    console.log(td);
    this.tstdata = td;
    this.max = this.tstdata.length - 1;
    let cards = this.tb.getTests(td);
    
    let that = this;
    this.cts = [];
    this.test_started = true;

    let viewContainerRef = this.appTest.viewContainerRef;
    viewContainerRef.clear();

    for(let i = cards.length-1; i >= 0; i--){
      let card = cards[i];
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(card.component);

      let componentRef = viewContainerRef.createComponent(componentFactory);
      //  Link card data
      (<TestComponent>componentRef.instance).data = card.data;
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
      (<TestComponent>componentRef.instance).save_results.subscribe(function(e){
        that.tb.addResult(e.type, e.presented, e.wrong, e.results, that.test_results);
      });
      //this.le.ccs.push(componentRef);
      this.cts.push(componentRef);
    }

    setTimeout(()=>{ that.updateTests(); }, 20);

  }


  //  Update test layout
  updateLayout(){
    /*
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
    */
  }

  //  Update tests
  updateTests() {
    this.setCurrentTestPosition(this.ctestpos)
  }

  //  Move next event
  mvNext(){
    //  Check limit
    if(this.ctestpos < this.max){
      for(let i in this.cts){
        let c = this.cts[i];
        if(c.instance.isActive() && typeof c.instance.getTestResult !== 'undefined'){
          c.instance.getTestResult();
          c.instance.pm.stop();
        }
      }
      this.ctestpos++;

      //  Calc completeness
      this.complete = Math.round((this.ctestpos / (this.max - 1)) * 100);

      this.updateTests();
    } else {
      this.uinputph = 'finish';
      this.complete = 100;
    }

  }

  //  Move prev event
  mvPrev(){
    //  Check limit
    if(this.ctestpos > this.min){
      this.ctestpos--;
      this.updateTests();
    }
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




}
