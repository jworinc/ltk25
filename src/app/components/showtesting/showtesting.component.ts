import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { TestComponent } from '../test/test.component';
import { TestDirective } from '../../directives/test.directive';
import { DataloaderService } from '../../services/dataloader.service';
import { TestbuilderService } from '../../services/testbuilder.service';
import { LoggingService } from '../../services/logging.service';
//import { LessonComponent } from '../lesson/lesson.component';

@Component({
  selector: 'app-showtesting',
  templateUrl: './showtesting.component.html',
  styleUrls: ['./showtesting.component.scss'],
  host: {'class': 'testing-wrapper-slide'},
})
export class ShowtestingComponent implements OnInit, AfterViewInit {

  public _show: any;
  public _scale: number;
  public layout: any;
  public tstdata: any;
  public cts: any;
  public ctestpos: number = 0;
  public max: number = 0;
  public min: number = 0;

  public global_header = "";
  public global_desc = "";

  public test_results: any = [];
  public test_started: boolean = false;
  public test_log_sent = false;
  public uinputph = 'teststart';
  public complete = 0;

  @Output() closetesting = new EventEmitter<boolean>();
  @Input('show')
  set show(show: boolean) {
    this._show = show;
    
    if(!show){
      this.saveTestResultsToLog();
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
      setTimeout(()=>{
        that.getTest();
      }, 1500);
      this.updateLayout();
    }
  }
  @Input('scale')
  set scsale(scale: number) {
    this._scale = scale;
    this.updateLayout();
  }

  @ViewChild(TestDirective) appTest: TestDirective;

  constructor(
      private dl: DataloaderService,
      private tb: TestbuilderService,
      private componentFactoryResolver: ComponentFactoryResolver,
      private logging: LoggingService,
  ) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {

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
      this.close();
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

  close(){
		this._show = false;
		//this.saveTestResultsToLog();
		this.closetesting.emit();
  }
  
  saveTestResultsToLog() {
    let sc = null;
    for(let i in this.cts){
      let c = this.cts[i];
      if(c.instance.isActive()){
        sc = c.instance; 
      }
    }
    if(typeof sc !== 'undefined' && sc !== null && typeof sc.card.position !== 'undefined'  && !this.test_log_sent) {
      //if(!this.sidetripmode){
        this.test_log_sent = true;
        this.logging.testEnd('TST', sc.card.position, this.test_results, this.ctestpos, this.dl.lu, this.complete)
          .subscribe(
            data => { console.log('Testing >>>>>>>>>>  Test Results Saved!'); console.log(data); },
            error => {
              console.log(error);
              alert('Logging End Test status: ' + error.status + ' ' + error.statusText);
            }
          );
      //} 
      this.clearResults();
    }
  }

  clearResults() {
    this.tb.clearResults(this.test_results);
  }

}
