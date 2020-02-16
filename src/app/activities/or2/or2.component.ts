import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseorComponent } from '../baseor/baseor.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-or2',
  templateUrl: './or2.component.html',
  styleUrls: ['./or2.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Or2Component extends BaseorComponent implements OnInit {
  @ViewChild(PlaysentenceDirective) psn;
  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, private or2log: LoggingService, private or1cs: ColorschemeService) {
  	super(element, sz, pms, or2log, or1cs);
  }


  public sentence_index = 0; 
  
  ngOnInit() {
    console.log(this.data);
    
    this.setHeader();
  	this.current_number = +this.data.cross_number;
    this.card_id = this.data.id;
    this.setCardNumber();
    //this.setCardId();

    this.card = this.data;
    
    this.current_header = this.card.header;

    //	Create list of word/image content of the card
    let content = '';
    for(let i = 0; i < this.data.content[0].parts.length; i++) {

      //	Get current list item
      this.words.push(this.data.content[0].parts[i].title.replace('(', '').replace(')', ''));

    }
    
    
    
    this.sentence_index = Math.floor(Math.random() * 100000);

  }

  playContentDescription() {
    
    this.disableNextSlide();

    this.blinkOnlyNext();

    //  Blink enter button to play sentence
    let that = this;
    setTimeout(()=>{
      that.blinkEnter();
    }, 2000);
  }

  repeat(){
    let that = this;
    this.pms.stop();
    if(typeof this.card.content["0"]["NextInst"] === 'undefined' || this.card.content["0"]["NextInst"].length === 0){
      this.blinkOnlyNext();
    } else {
      this.card.content[0].desc = this.card.content["0"]["NextInst"][0].pointer_to_value;
      this.setGlobalDesc(this.card.content["0"]["NextInst"][0].pointer_to_value);
      this.pms.sound(this.card.content["0"]["NextInst"][0].audio, function(){
        that.blinkOnlyNext();
      }, 100);
    }
		
  }

  //	Validation of user input
	validate() {
		if(this.uinputph === 'finish')
			return true;
		else return false;
  }
  
  	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			//if(!this.validate()) {
        this.current_word = 0;
        this.answer_word = this.words[this.current_word];
				//	Play card description
				//this.playContentDescription();
				this.playCardDescription();
        this.disableMoveNext();
        
				
			//} else {
			//	this.enableMoveNext();
			//}
      this.prevent_dubling_flag = true;

      let that = this;
      //	After setting card story we have to wait before angular process playwords directive
      setTimeout(()=>{
        let d = that.psn;
        d.compileSentence();
      }, 20);
      this.setGlobalHeader("ORAL READING");
		}
		
	}
  
  next() {
    this.current_word++;
    let that = this;
    if(this.current_word < this.card.content[0].parts.length){
      this.answer_word = this.words[this.current_word];
      setTimeout(()=>{
        that.psn.origin_text = '';
        that.psn.compileSentence();
        that.repeat();
      }, 20);
    } else {
      let that = this;
      this.playCorrectSound(()=>{
        that.enableMoveNext();
        that.uinputph = 'finish';
        setTimeout(()=>{ that.moveNext(); }, 500);
      });
      
    }
  }

  //	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			//this.playCorrectSound();
			this.enableNextCard();
		} else {
			this.psn.playSentenceByIndex(this.sentence_index);
		}
	}



}