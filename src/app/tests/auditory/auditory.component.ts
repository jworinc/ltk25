import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';


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

  public result:any= [];

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
  }

  show() {
    console.log(this.data);
    this.card = this.data['content'];
    //this.pms.word(this.data['description'],function(){});
    console.log(this.card);
    this.ind = 0;
    this.count = 0;
    this.isResult = false;
    this.result = [];
    this.getWords();
  }

  getWords(){
    this.pms.word(this.card[this.ind].answer.wavename,function(){});
    this.words = this.card[this.ind].words;
  }

  getNext(){
    this.ind++;
    if(this.ind < this.card.length)
    this.getWords();
    else
    setTimeout(()=>{ this.next(); }, 2000);
  }

  getResult(){
      this.isResult = true;
  }

  getAnswer(answer){
    let data;
    if(this.result.length != this.card.length){
      if(answer ===  this.card[this.ind].answer.title){
        //this.count++;
        data = { "isCorrect" : true, "word":answer}
      }else{
        data = { "isCorrect" : false, "word":answer}
      }
      this.result.push(data);
      this.getNext();
    }
    
  }

  enter(){
    console.log("I am from the auditory");
  }

}
