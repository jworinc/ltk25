import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { TestComponent } from '../test/test.component';
import { TestDirective } from '../../directives/test.directive';
import { DataloaderService } from '../../services/dataloader.service';
import { TestbuilderService } from '../../services/testbuilder.service';
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
  public data: any;
  public cts: any;
  public cpos: number = 0;
  public max: number = 0;
  public min: number = 0;

  public global_header = "";
  public global_desc = "";

  @Input('show')
  set show(show: boolean) {
    this._show = show;
    
    if(!show){
      this.data = null;
      this.layout = {
        'transform': 'scale('+this._scale+', '+this._scale+')',
        'opacity': 0
      }
    }
    else {
      let that = this;
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
      //private le: LessonComponent
  ) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {

  }

  //  Load test
  async getTest() {
    let data = await this.dl.getTest();
    console.log('----------   Testing data   -------------');
    console.log(data);
    this.data = data;
    this.max = this.data.length - 1;
    let cards = this.tb.getTests(data);
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
        that.moveNext();
      });
      //  Link move prev event
      (<TestComponent>componentRef.instance).mprev.subscribe(function(){
        that.movePrev(); 
      });
      //  Link global header
      (<TestComponent>componentRef.instance).set_global_header.subscribe(function(e){
        that.global_header = e;
      });
      //  Link global description
      (<TestComponent>componentRef.instance).set_global_desc.subscribe(function(e){
        that.global_desc = e;
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
    this.setCurrentTestPosition(this.cpos)
  }

  //  Move next event
  moveNext(){
    //  Check limit
    if(this.cpos < this.max){
      this.cpos++;
      this.updateTests();
    }

  }

  //  Move prev event
  movePrev(){
    //  Check limit
    if(this.cpos > this.min){
      this.cpos--;
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
