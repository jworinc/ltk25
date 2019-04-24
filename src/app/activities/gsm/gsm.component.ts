import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gsm',
  templateUrl: './gsm.component.html',
  styleUrls: ['./gsm.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GsmComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gsmlog: LoggingService, private gwmcs: ColorschemeService) {
    super(elm, sanitizer, playmedia, gsmlog, gwmcs);
  }

  ngOnInit() {
    this.setHeader();
    this.display_result = {right: 0, wrong: 0};
    this.current_number = 0;
    this.current_card_number = +this.data.cross_number;
    this.card_id = this.data.id;
    this.setCardNumber();

    this.card = this.data;  
    console.log(this.data);
    this.current_header = this.card.header;
    this.currentIndex = 0;
    this.setWords();
    this.card_object = 'Word';
  }

  //	Set header for current card
public current_header = '';

//	User answer phases, rec, listen, compare, split to syllables, finish
public uinputph = 'rec';

public input_data = '';

public words = [];
public numbers=[];
public Displaywordsarray=[];
public answers = [];
public audios = [];
public expected = [];
public display_result: any;
public currentIndex:any;
public expectedIndex:any;

//	Define current card number
public current_card_number: any;
public card_id: any;
public current_number: any;
public current_set = 0;
public expected_string: any;
public current_word: any;

//	Validation of user input
validate() {
  if(this.uinputph === 'finish')
    return true;
  else return false;
}

//	Create formated user input string for errors log
getUserInputString() {
  return this.input_data;
}

//	Create formated expected string for errors log
getExpectedString() {
  return this.expected_string;
}

repeat(){
  if(this.uinputph !== 'finish'){
    this.playContentDescription();
  } else {
    this.enter();
  }
}

//	Callback for show card event
show() {
  //	If card is active and it is not dubling
  if(this.isActive() && !this.prevent_dubling_flag){
    //	If user not enter valid data yet
    if(!this.validate()) {
      
      //	Play card description
      //this.playContentDescription();
      this.playCardDescription();
      this.disableMoveNext();
      
    } else {
      this.enableMoveNext();
    }
    this.prevent_dubling_flag = true;
  }
  
}

setFocus(){
  
};
public split_loop_ready: boolean = false;
    splitLoop() {
  
      let that = this;
  
      //	Play the first loop instruction in sequence
      const pr1 = Observable.create((observer) => {
        that.lastUncomplete = that.card.content[0].LoopInst[0];
        let i = that.card.content[0].LoopInst[0];
        that.card.content[0].desc = i.pointer_to_value;
        that.setGlobalDesc(i.pointer_to_value);
          if(typeof i.audio !== 'undefined' && i.audio !== ''){
            that.playmedia.sound(i.audio, function(){
              observer.next(0); observer.complete();
              that.setFocus();
            });
          } else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
          
      })
      .pipe(flatMap((result) => {
        return Observable.create((observer) => {
          if(that.card.content[0].LoopInst.length > 1){
          that.lastUncomplete = that.card.content[0].LoopInst[1];
          let i = that.card.content[0].LoopInst[1];
          that.card.content[0].desc = i.pointer_to_value;
          that.setGlobalDesc(i.pointer_to_value);
            if(typeof i.audio !== 'undefined' && i.audio !== ''){
              that.playmedia.sound(i.audio, function(){
                observer.next(0); observer.complete();
              });
            } else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
          } else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
        });
      }))
      .pipe(flatMap((result) => {
        return Observable.create((observer) => {
          if(that.card.content[0].LoopInst.length > 2){
          that.lastUncomplete = that.card.content[0].LoopInst[2];
          let i = that.card.content[0].LoopInst[2];
          that.card.content[0].desc = i.pointer_to_value;
          that.setGlobalDesc(i.pointer_to_value);
            if(typeof i.audio !== 'undefined' && i.audio !== ''){
              that.playmedia.sound(i.audio, function(){
                observer.next(0); observer.complete();
              });
            } else  setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
          } else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
        });
      }));
      
      pr1.subscribe((finalResult) => {
        that.split_loop_ready = true;
      });      
  
    }

//	Used to play task word and sound exactly after instructions play finished
playContentDescription() {

  this.splitLoop();
  this.playmedia.word(this.Displaywordsarray[this.currentIndex].wavename, function(){}, 300);
  
}
//	Overload default play description function

setWords() {
  this.Displaywordsarray = [];
  this.numbers = [];
  this.words = [];
  this.audios = [];
  for(var i =0; i< this.card.content.length;i++)
  {
    this.numbers.push(this.card.content[i].parts[0].number);
    this.words.push(this.card.content[i].parts[0].word)
    this.audios.push(this.card.content[i].parts[0].wavename);
    this.Displaywordsarray.push(this.card.content[i].parts[0]);
  }
  do{
    this.currentIndex = Math.floor(Math.random() * (this.Displaywordsarray.length));
  }while(this.expected.indexOf(this.Displaywordsarray[this.currentIndex].number) != -1)
  

  this.expected.push(this.Displaywordsarray[this.currentIndex].number);

  this.card_object = 'Word';
  this.card_instance = this.Displaywordsarray[this.currentIndex].word;
  this.expected_string = this.Displaywordsarray[this.currentIndex].number;

}

getWords() {

  //	Check if all letters are entered
  if(this.expected.length >= this.Displaywordsarray.length){
    this.showResults();
    return;
  }

  this.current_number++;
  this.setWords();
  let that = this;
  this.playmedia.word(this.Displaywordsarray[this.currentIndex].wavename, function(){
    that.current_presented++;
  }, 300);

}

addAnswer(ind) {

  if(this.answers.length >= this.expected.length) return;

  this.input_data = this.numbers[ind];
  if(this.Displaywordsarray[ind].number !== this.Displaywordsarray[this.currentIndex].number) this.result();

  this.answers.push(this.Displaywordsarray[ind].number);
  
  this.getWords();

}

showResults(){
  for(var i in this.answers){
    var a = this.answers[i];
    var e = this.expected[i];
    if(a === e) this.display_result.right++;
    else this.display_result.wrong++;
  }

  this.card.content[0].desc = '';

  let that = this;
  //	Play chimes
  this.playmedia.action('CHIMES', function(){
    that.uinputph = 'finish';
    that.enter();
  }, 300);
 
  this.lastUncomplete = this.card.content[0].RespAtEnd[0];
  this.card.content[0].desc = this.card.content[0].RespAtEnd[0].pointer_to_value;
  this.setGlobalDesc(this.card.content[0].desc);
  this.blinkWord();
  this.playmedia.sound(this.card.content[0].RespAtEnd[0].audio, function(){});

  this.elm.nativeElement.querySelector('.cust-div').style.display = 'none';
  this.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';
}

 //	Phase incorrect message
 respIfIncorrect() {
      
  let that = this;

  //	Play the first part
  const pr1 = Observable.create((observer) => {

    that.lastUncomplete = that.card.content[0].RespIfIncorrect[0];
    let i = that.card.content[0].RespIfIncorrect[0];
    that.card.content[0].desc = i.pointer_to_value;
    that.setGlobalDesc(i.pointer_to_value);
      if(typeof i.audio !== 'undefined' && i.audio !== ''){
        that.playmedia.sound(i.audio, function(){
          
          that.lastUncomplete = that.card.content[0].RespIfIncorrect[1];
        let i = that.card.content[0].RespIfIncorrect[1];
        that.card.content[0].desc = i.pointer_to_value;
        that.setGlobalDesc(i.pointer_to_value);
        if(typeof i.audio !== 'undefined' && i.audio !== ''){
            that.playmedia.sound(i.audio, function(){});
            that.playmedia.word(this.Displaywordsarray[this.currentIndex].wavename, function(){
              observer.next(0); observer.complete();
            that.setFocus();
            that.blinkEnter();
            });
          }
        });
      } else setTimeout(function(){ observer.next(0); observer.complete(); }, 1);
    
  });
  
  pr1.subscribe((finalResult) => {
      
    //	Show right answer
    //that.split_syllables_show = true;
    that.uinputph = 'sylhelp';
  });

}


//	Enter click handler
enter() {
  if(this.uinputph === 'finish'){
    this.enableNextCard();
  } 
}



}