import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { PickElementService } from '../../services/pick-element.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comprehension',
  templateUrl: './comprehension.component.html',
  styleUrls: ['./comprehension.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class ComprehensionComponent extends BasetestComponent implements OnInit {

  public card:any;
  public type = '';
  public isAnswered = -1;
  
  public result:any=[];
  public test_complete = false;

  
  public subtitles: any[] = [
    {
      type: 'intro',
      key: 'chs_thebest_word',
      vawe: '_SCTBWTCTS'
    }
  ];


  constructor(private element:ElementRef, 
              private sz: DomSanitizer, 
              private pms: PlaymediaService,
              private pe: PickElementService,
              public translate: TranslateService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
    this.card = this.data;
    this.type = this.data.type;
  }

  show() {
    let that = this;
    console.log(this.data);
    this.result = [];
    this.card = this.data['content'];
    this.isAnswered = -1;
    this.test_complete = false;
    console.log(this.card);
    this.presented++;
    this.set_subtitles.emit(this.translate.instant(this.subtitles[0].key));
    this.pms.stop();
    this.pms.sound(this.subtitles[0].vawe, ()=>{
      that.intro_sub_played = true;
    }, 500);
  }

  // getAnswer(answer){
  //   if(answer == this.card.answer)
  //   this.isAnswered = 1;
  //   else
  //   this.isAnswered = 0;
  // }

  getAnswer(answer){
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    let data;

    if(this.result.length == 0){

      if(answer == this.card.answer){
        data = { "isCorrect" : true, "answer":answer, "expected": this.card.answer, "sentence": this.card.sentence};
        this.result.push(data);
      }
      else{
        data = { "isCorrect" : false, "answer":answer, "expected": this.card.answer, "sentence": this.card.sentence};
        this.result.push(data);
        //this.result.push({ "isCorrect" : true, "word":this.card.answer});
        this.wrong++;
      }
      
      let that = this;
      this.test_complete = true;
      setTimeout(()=>{
        that.next(); 
      }, 2000);

    }
    
  }

  getTestResult() {
    if(this.test_complete) return this.saveResults({type: this.type, presented: this.presented, wrong: this.wrong, results: this.result});
    return null;
  }

  enter(){
    console.log("I am from the comprehension");
  }

}
