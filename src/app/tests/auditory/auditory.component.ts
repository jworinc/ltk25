import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { PickElementService } from '../../services/pick-element.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auditory',
  templateUrl: './auditory.component.html',
  styleUrls: ['./auditory.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class AuditoryComponent extends BasetestComponent implements OnInit {

  public card:any;
  public words:any;
  public ind = 0;
  public count = 0;
  public isResult:boolean = false;
  
  public test_complete = false;

  public result:any= [];

  public subtitles: any[] = [
    {
      type: 'intro',
      key: 'clck_onthe_word',
      vawe: '_SCOTWTYH'
    }
  ];

  constructor(private element:ElementRef, 
              private sz: DomSanitizer, 
              private pms: PlaymediaService,
              private pe: PickElementService,
              private translate: TranslateService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
    this.card = this.data;
    //this.type = this.data.type;
  }

  show() {
    let that = this;
    console.log(this.data);
    this.card = this.data['content'];
    //this.pms.word(this.data['description'],function(){});
    console.log(this.card);
    this.ind = 0;
    this.count = 0;
    this.isResult = false;
    this.result = [];
    this.test_complete = false;
    this.getWords();
    this.set_subtitles.emit(this.translate.instant(this.subtitles[0].key));
    this.pms.stop();
    this.pms.sound(this.subtitles[0].vawe, ()=>{
      that.intro_sub_played = true;
      if(that.ind < that.card.length && typeof that.card[that.ind] !== 'undefined')
        that.pms.word(that.card[that.ind].answer.wavename,function(){});
    }, 500);
  }
  
  repeat() {
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    this.pms.stop();
    this.pms.word(this.card[this.ind].answer.wavename,function(){});
  }

  getWords(){
    if(this.intro_sub_played) this.pms.word(this.card[this.ind].answer.wavename,function(){});
    this.words = this.card[this.ind].words;
    this.presented++;
  }

  getNext(){
    this.ind++;
    if(this.ind < this.card.length)
    this.getWords();
    else{
      let that = this;
      this.test_complete = true;
      setTimeout(()=>{
        that.next(); 
      }, 2000);
    }
    
  }

  getResult(){
      this.isResult = true;
  }

  getAnswer(answer){
    
    //	If mouse event locked by feedback
    if(this.pe.mouseLock()) return;
    let data;
    if(this.result.length != this.card.length){
      if(answer ===  this.card[this.ind].answer.title){
        //this.count++;
        data = { "isCorrect" : true, "answer": answer, "expected": this.card[this.ind].answer.title}
      }else{
        data = { "isCorrect" : false, "answer": answer, "expected": this.card[this.ind].answer.title};
        this.wrong++;
      }
      this.result.push(data);
      this.getNext();
    }
    
  }

  getTestResult() {
    if(this.test_complete) return this.saveResults({type: this.type, presented: this.presented, wrong: this.wrong, results: this.result});
    else return null;
  }

  enter(){
    console.log("I am from the auditory");
  }

}
