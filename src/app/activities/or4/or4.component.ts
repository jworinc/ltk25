import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Or3Component } from '../or3/or3.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-or4',
  templateUrl: './or4.component.html',
  styleUrls: ['./or4.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Or4Component extends Or3Component implements OnInit, DoCheck {

    constructor(private or4el:ElementRef, private or4sn: DomSanitizer, private or4pm: PlaymediaService, private or4log: LoggingService, private or4cs: ColorschemeService) {
  		super(or4el, or4sn, or4pm, or4log, or4cs);
    }

    public answer_type: any;

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

    //	Enter click handler
	enter() {
		//	Check if question was asked and num of questions was not exced
		if(this.instruction2_flag && typeof this.card.content[0].questions !== 'undefined' && 
			typeof this.card.content[0].questions.length !== 'undefined' && 
			this.card.content[0].questions.length >= this.current_question){
			let that = this;
			let q = this.card.content[0].questions[this.current_question-1];
			if(q.hint1 !== '' || q.hint2 !== '' || q.hint3 !== ''){
				this.or4el.nativeElement.querySelectorAll("input[name='user_input']").forEach((e)=>{
					if(e.checked) that.input_data = e.value;
				});
			} else {
				this.input_data = this.or4el.nativeElement.querySelector('#user-answer-or3').value;
			}
			//	Check if user input something and compare it with right answer
			if(this.input_data !== '' && this.input_data.toLowerCase() === this.answer_word.toLowerCase()){
				//	Check if it was last question, finish card
				if(this.card.content[0].questions.length === this.current_question){
					this.playCorrectSound();
					this.uinputph = 'finish';
					this.enableNextCard();
				} else {
					this.or4pm.action('DING', function(){});
					setTimeout(function(){
						that.instruction2_flag = false;
						that.next();
						that.input_data = '';
						
					}, 1000);
				}
			} else {
				this.result();
				this.respIncerrect();
			}

			
		} else {
			//playmedia.sound('_STNQR', function(){});
			//this.playCorrectSound();
			//this.enableNextCard();
		}
	}


    repeat() {
		if(this.uinputph === 'finish'){
			this.enableNextCard();
			return;
		}
		if(!this.instruction2_flag){
			this.playCardDescription();
		} else {
			this.nextInstructions();
		}
	}

	respIncerrect(){
		if(typeof this.card.content[0]['RespIfIncorrect'] === 'undefined') return;
		let ric = this.card.content[0]['RespIfIncorrect'];

		//	Set input to red
		let el = this.or4el.nativeElement.querySelector('.or3-question-word-input');
		if(el !== null) el.style.backgroundColor = 'red';
		let that = this;
		let ric_db = [];
		function setRicDesc(){
			if(ric_db.length <= 0) return;
			that.card.content[0].desc = ric_db.shift();
			that.setGlobalDesc(that.card.content[0].desc);
		}
		function checkIfNextOrExit(){
			if(that.card.content[0].questions.length > that.current_question){
				setTimeout(function(){
					that.input_data = '';
					that.instruction2_flag = false;
					that.next();
				}, 1000);
			} else {
				that.uinputph = 'finish';
				that.enableNextCard();
			}
		}
		for(let i in ric){
			let a = ric[i]
			ric_db.push(a.pointer_to_value);
			if(typeof a.audio !== 'undefined' && a.audio !== ''){
				//	Check if last
				if(parseInt(i) >= ric.length - 1){
					this.or4pm.sound(a.audio, function(){
						if(that.answer_type === 'word'){
		    				that.or4pm.word(that.answer_word, function(){
		    					checkIfNextOrExit();
		    				}, 300);
			    			that.input_data = that.answer_word;
			    			
			    			//that.or4el.nativeElement.querySelector('.or3-question-word-input').style.backgroundColor = 'lightgreen';
			    			let el = that.or4el.nativeElement.querySelector('.or3-question-word-input');
							if(el !== null){
								el.style.backgroundColor = 'lightgreen';
								el.value = that.answer_word;
							}
			    		} else {

			    			that.blinkCorrect(function(){
			    				checkIfNextOrExit();
			    			});
			    		}
	    			}, 300);
				} else {
					this.or4pm.sound(a.audio, function(){
	    				setRicDesc();
	    			}, 300);
				}
    			
    		} 
		}
	    setRicDesc();


	}

	next() {
		if(this.instruction2_flag) return;
		this.instruction2_flag = true;
		this.showQuestion();
		this.nextInstructions();
		this.enableMoveNext();
	}

	nextInstructions(){
		this.or4pm.stop();
		let that = this;
		//	Instruction key for sentence in word
		let ikey = 'LoopInstLD';

		if(this.answer_type === 'option') ikey = 'LoopInstLS';

		
		let a = this.card.content[0][ikey][0];
		this.card.content[0].desc = a.pointer_to_value;
		this.setGlobalDesc(a.pointer_to_value);
		if(typeof a.audio !== 'undefined' && a.audio !== ''){
			this.or4pm.sound(a.audio, function(){
				that.setFocus();
			});
		}
	}

	//	Show question
	public current_question = 0;
	showQuestion() {

		if(typeof this.card.content[0].questions !== 'undefined' && 
			typeof this.card.content[0].questions.length !== 'undefined' && 
			this.card.content[0].questions.length > this.current_question){

			let q = this.card.content[0].questions[this.current_question];

			this.or4el.nativeElement.querySelector('.or3-story-question-wrap').innerHTML = '';

			//	Check if with answer selection or with word typing
			if(q.hint1 !== '' || q.hint2 !== '' || q.hint3 !== ''){
				this.answer_type = 'option';
				let variants = [];
				if(q.hint1 !== '') variants.push(q.hint1);
				if(q.hint2 !== '') variants.push(q.hint2);
				if(q.hint3 !== '') variants.push(q.hint3);
				this.answer_word = q.answer.toLowerCase();
				
				//	Fill logging information
				this.card_object = 'Question';
				this.card_instance = q.title.replace(/(\(|\))/ig, '');
				this.expected_string = this.answer_word;

				let qt = '<span>' + q.title.replace(/(\(|\))/ig, '') + '</span>';
				let vr = '<span class="or4-question-variants">';
				for(let i in variants){
					if(this.answer_word === variants[i].substr(0, 1).toLowerCase()){
						vr += '<input type="radio" value="' + variants[i].substr(0, 1).toLowerCase() + '" name="user_input"><span class="or4-correct-answer">' + variants[i] + '</span>';
					} else {
						vr += '<input type="radio" value="' + variants[i].substr(0, 1).toLowerCase() + '" name="user_input"><span>' + variants[i] + '</span>';
					}
					
				}
				vr += '</span>';
				this.or4el.nativeElement.querySelector('.or3-story-question-wrap').innerHTML = qt+vr;

			} else {
				this.answer_type = 'word';
				//	Get answer word
				let ar = /\([A-Za-z]*\)/ig;
				let a = q.title.match(ar);
				if(a !== null && typeof a.length !== 'undefined' && a.length > 0){
					this.answer_word = a[0].replace(/(\(|\))/ig, '');
				} else {
					this.answer_word = '';
				}
				
				//	Fill logging information
				this.card_object = 'Sentence';
				this.card_instance = q.title.replace(/(\(|\))/ig, '');
				this.expected_string = q.title;

				//	Replace answer word with a input
				q.title = q.title.replace(ar, '<input type="text" class="or3-question-word-input" id="user-answer-or3" />');
				
				this.or4el.nativeElement.querySelector('.or3-story-question-wrap').innerHTML = '<span>' + q.title + '</span>';
			

			}

			this.or4el.nativeElement.querySelector('.bw1-description').style.display = 'none';
			this.or4el.nativeElement.querySelector('.or3-story-question-wrap').style.display = 'flex';
			this.current_question++;

		}


	}


	hint() {
	}

	blinkCorrect(cb=()=>{}) {
		let that = this;
		setTimeout(function(){
			that.or4el.nativeElement.querySelector('.or4-correct-answer').style.backgroundColor = 'rgba(100, 255, 100, 0.7)';
			setTimeout(function(){
				that.or4el.nativeElement.querySelector('.or4-correct-answer').style.backgroundColor = 'transparent';
				setTimeout(function(){
					that.or4el.nativeElement.querySelector('.or4-correct-answer').style.backgroundColor = 'rgba(100, 255, 100, 0.7)';
					if(typeof cb !== 'undefined') cb();
				}, 400);
			}, 400);
		}, 400);
	}

	ngDoCheck() {}




}