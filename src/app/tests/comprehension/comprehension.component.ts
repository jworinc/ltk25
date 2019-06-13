import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';

@Component({
  selector: 'app-comprehension',
  templateUrl: './comprehension.component.html',
  styleUrls: ['./comprehension.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class ComprehensionComponent extends BasetestComponent implements OnInit {

  public card:any;
  public isAnswered = -1;
  
  public result:any=[];

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
  }

  show() {
    console.log(this.data);
    this.result = [];
    this.card = this.data['content'];
    this.isAnswered = -1;
    console.log(this.card);
  }

  // getAnswer(answer){
  //   if(answer == this.card.answer)
  //   this.isAnswered = 1;
  //   else
  //   this.isAnswered = 0;
  // }

  getAnswer(answer){
    let data;

    if(this.result.length == 0){

      if(answer == this.card.answer){
        data = { "isCorrect" : true, "word":answer};
        this.result.push(data);
      }
      else{
        data = { "isCorrect" : false, "word":answer}
        this.result.push(data);
        this.result.push({ "isCorrect" : true, "word":this.card.answer})
      }
      

      setTimeout(()=>{ this.next(); }, 2000);

    }
    
  }

  enter(){
    console.log("I am from the comprehension");
  }

}
