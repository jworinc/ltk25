import { Component, OnInit, Input, ElementRef, DoCheck, ViewChild } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseorComponent } from '../baseor/baseor.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { PlaywordsDirective } from '../../directives/playwords.directive';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-or3',
  templateUrl: './or3.component.html',
  styleUrls: ['./or3.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Or3Component extends BaseorComponent implements OnInit, DoCheck {

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService, private or3log: LoggingService, private or3cs: ColorschemeService) {
  	super(element, sz, pms, or3log, or3cs);
  }

  public instruction2_flag: boolean = false;
  public current_question = 0;
  @ViewChild(PlaywordsDirective) pwds;
  ngOnInit() {
  	this.setHeader();
  	this.current_number = +this.data.cross_number;
	this.card_id = this.data.id;
	this.setCardNumber();
	//this.setCardId();

	this.card = this.data;
	
	this.current_header = this.card.header;

	this.setCard();

	//	After setting card story we have to wait before angular process playwords directive
	setTimeout(()=>{
		let d = this.pwds;
		d.initText();
	}, 100);
	
  }

  	setCard() {
				
		this.input_data = '';
		this.letters = [];
	
		this.answer_word = this.expected_string = this.card.content[this.current_card_instance].parts.body;

	}


	repeat() {
		if(!this.instruction2_flag){
			this.playCardDescription();
		} else {
			this.nextInstructions();
		}
	}

	respIncorrect(){
		let that = this;
		this.pms.stop();
		if(typeof this.card.content[0]['Response If Incorrect'] === 'undefined') return;
		let ric = this.card.content[0]['Response If Incorrect'];

		//	Set input to red
		this.element.nativeElement.querySelector('.or3-question-word-input').style.backgroundColor = 'red';

		let ric_db = [];
		function setRicDesc(){
			if(ric_db.length <= 0) return;
			that.card.content[0].desc = ric_db.shift();
			that.setGlobalDesc(that.card.content[0].desc);
		}
		for(let i in ric){
			let a = ric[i]
			ric_db.push(a.pointer_to_value);
			if(typeof a.audio !== 'undefined' && a.audio !== ''){
				//	Check if last
				if(parseInt(i) >= ric.length - 1){
					this.pms.sound(a.audio, function(){
	    				that.setFocus();
	    			});
				} else {
					this.pms.sound(a.audio, function(){
	    				setRicDesc();
	    			}, 300);
				}
    			
    		} 
		}
		setRicDesc();


	}

	//	Enter click handler
	enter() {
		let that = this;
		if(this.enter_trottle) return;
		this.enter_trottle = true;
		setTimeout(()=>{ that.enter_trottle = false; }, 800);
		//	Check if question was asked and num of questions was not exced
		if(this.instruction2_flag && typeof this.card.content[0].questions !== 'undefined' && 
			typeof this.card.content[0].questions.length !== 'undefined' && 
			this.card.content[0].questions.length >= this.current_question){

			this.input_data = this.element.nativeElement.querySelector('#user-answer-or3').value;

			//	Check if user input something and compare it with right answer
			if(this.input_data !== '' && this.input_data.toLowerCase() === this.answer_word.toLowerCase()){
				let el = this.element.nativeElement.querySelector('.or3-question-word-input');
				if(el !== null){
					el.style.backgroundColor = 'lightgreen';
				}
				//	Check if it was last question, finish card
				if(this.card.content[0].questions.length === this.current_question){
					this.playCorrectSound();
					this.uinputph = 'finish';
					this.enableNextCard();
				} else {
					this.playCorrectSound(()=>{
						that.instruction2_flag = false;
						that.next();
						that.input_data = '';
					});
	
				}
			} else {
				this.result();
				this.respIncorrect();
			}

			
		} else {
			
		}
	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				
				//	Play card description
				this.playCardDescription();
				this.disableMoveNext();
				
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.showHint();
		}
		
	}

	setFocus(){
		let e = this.element.nativeElement.querySelector('.or3-question-word-input');
		if(typeof e !== 'undefined' && e !== null){
			e.focus();
		}
	};

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		this.disableNextSlide();
		this.blinkOnlyNext();
	}

	nextInstructions(){
		this.pms.stop();
		let ib = [];
		let that = this;
		function nextInstruction(){
			if(ib.length <= 0) return;
			that.card.content[0].desc = ib.shift();
			that.setGlobalDesc(that.card.content[0].desc);
			
		}
		for(let i in this.card.content[0].Instructions2){
			let a = this.card.content[0].Instructions2[i];
			ib.push(a.pointer_to_value);
			if(typeof a.audio !== 'undefined' && a.audio !== ''){
				//	Check if last
				if(parseInt(i) >= this.card.content[0].Instructions2.length - 1){
					this.pms.sound(a.audio, function(){
	    				that.setFocus();
	    			});
				} else {
					this.pms.sound(a.audio, function(){
	    				nextInstruction();
	    			}, 300);
				}
    			
    		} else {
    			//this.showQuestion();
    		}
		}
		nextInstruction();
	}
	
	//	Next button click handler
	next() {
		if(this.instruction2_flag || typeof this.card.content[0].Instructions2 === 'undefined') return;
		this.instruction2_flag = true;
		this.nextInstructions();
		this.showQuestion();
		this.enableMoveNext();
	}

	//	Show question
	showQuestion() {

		if(typeof this.card.content[0].questions !== 'undefined' && 
			typeof this.card.content[0].questions.length !== 'undefined' && 
			this.card.content[0].questions.length > this.current_question){

			let q = this.card.content[0].questions[this.current_question];

			//	Get answer word
			let ar = /\([A-Za-z]*\)/ig;
			let a = q.title.match(ar);
			if(a !== null && typeof a.length !== 'undefined' && a.length > 0){
				this.answer_word = a[0].replace(/\(/ig, '').replace(/\)/ig, '');
			} else {
				this.answer_word = '';
			}
			
			//	Fill logging information
			this.card_object = 'Sentence';
			this.card_instance = q.title.replace(/\(/ig, '').replace(/\)/ig, '');
			this.expected_string = q.title;

			//	Replace answer word with a input
			q.title = q.title.replace(ar, '<input type="text" class="or3-question-word-input" id="user-answer-or3" />');
			 

			this.element.nativeElement.querySelector('.or3-story-question-wrap').innerHTML = '';
			//this.element.nativeElement.querySelector('.or3-story-question-wrap')
			//	.insertAdjacentHTML('beforeend', '<span>' + q.title + '</span>');
			this.element.nativeElement.querySelector('.or3-story-question-wrap')
				.innerHTML = '<span>' + q.title + '</span>';
			
			this.element.nativeElement.querySelector('.bw1-description').style.display = 'none';
			this.element.nativeElement.querySelector('.or3-story-question-wrap').style.display = 'flex';
			this.current_question++;
			
			let that = this;
			setTimeout(()=>{ that.cleanInputBg(); }, 10);
		}


	}

	hint() {
		if(!this.instruction2_flag) return;
		let that = this;
		this.current_hint_level = 1;
		this.pms.word(this.answer_word, function(){
			that.setFocus();
		});
	}


	cleanInputBg() {
	    if(this.isActive()){
	    	let e = this.element.nativeElement.querySelector('.or3-question-word-input');
	    	if(typeof e !== 'undefined' && e !== null){
	    		e.style.backgroundColor = 'white';
	    	}
	    }
	    
	}

	ngDoCheck() {}



}