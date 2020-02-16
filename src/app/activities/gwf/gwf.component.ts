import { Component, OnInit, Input, ElementRef, ViewChild, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-gwf',
  templateUrl: './gwf.component.html',
  styleUrls: ['./gwf.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GwfComponent extends BaseComponent implements OnInit, DoCheck {

	@ViewChild(PlaysentenceDirective) psn;

    constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gwflog: LoggingService, private gwfcs: ColorschemeService) {
  		super(elm, sanitizer, playmedia, gwflog, gwfcs);
    }

    ngOnInit() {
    	this.setHeader();
    	this.current_number = +this.data.cross_number;
    	this.card_id = this.data.id;
		this.setCardNumber();
		//this.setCardId();

		this.card = this.data;
		
		this.current_header = this.card.header;

		this.max_presented = this.card.content.length;

		this.sentence_index = Math.floor(Math.random() * 100000);
		this.display_result = {right: 0, wrong: 0};

		this.setupTheGame();


    }

    //	Set header for current card
	public current_header = '';
	
	//	User answer phases, rec, listen, compare, split to syllables, finish
	public uinputph = 'rec';

	public current_sentence = '';
	public current_set = 0;
	public sentence_index = 0;

	public display_result: any;

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public sentences: any;
	public expected: any;
	public answers: any;
	public variants: any;
	public expected_string: any;
	public input_data: any;
	
	//	Shuffles array in place.
	//	@param {Array} a items An array containing the items.
	shuffle(a) {
	    let j, x, i;
	    let out = [];
	    for(let k in a)
	    	out.push(a[k]);
	    for (i = out.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1));
	        x = out[i];
	        out[i] = out[j];
	        out[j] = x;
	    }
	    return out;
	}

	setupTheGame() {

		this.sentences = [];
		this.expected = [];
		this.answers = [];
		this.variants = [];

		this.current_sentence = '';
		//this.current_set = 0;

		let ar = /\([A-Za-z]*\)/ig;

		for(let i in this.card.content[0].parts){
			let s = this.card.content[0].parts[i];

			let exp = s.title.match(ar)[0].replace(/(\(|\))/ig, '');

			if(this.expected.indexOf(exp) < 0){
				this.expected.push(exp);
				this.sentences.push(s.title.replace(ar, '<span class="gwf-answer-placeholder">...<span class="gwf-ap-mark"></span></span>'));
			}

		}

		this.current_sentence = this.sentences[this.current_set];

		//	Logging
		let q = this.card.content[0].parts[this.current_set];
		this.card_object = 'Sentence';
		this.card_instance = q.title.replace(/\(/ig, '').replace(/\)/ig, '');
		this.expected_string = q.title;

		//	Prepare variants
		this.prepVariants();

	}

	//	Prepare variants
	prepVariants() {
		this.variants = this.shuffle(this.expected).slice(0, 3);
		//	Check if we don't have answer in variants
		if(this.variants.indexOf(this.expected[this.current_set]) < 0) {
			//	remove one word and push right answer instead
			this.variants = this.variants.slice(0, this.variants.length - 1);
			this.variants.push(this.expected[this.current_set]);
			this.variants = this.shuffle(this.variants);
		}
		
	}	

	showNextSentence() {
		let that = this;
		if(this.current_set < this.sentences.length - 1){
			this.current_set++;
			this.current_sentence = this.sentences[this.current_set];
    	//	Prepare variants
			this.prepVariants();

			//	Logging
			let q = this.card.content[0].parts[this.current_set];
			this.card_object = 'Sentence';
			this.card_instance = q.title.replace(/\(/ig, '').replace(/\)/ig, '');
			this.expected_string = q.title;
			this.current_presented++;

			this.user_answer_received_flag = false;
			this.elm.nativeElement.querySelector('.gwf-answer-right').style.display = 'none';
			this.elm.nativeElement.querySelector('.gwf-answer-wrong').style.display = 'none';
			setTimeout(function(){ that.blinkAP(); }, 400);
			setTimeout(function(){
				//	After setting card story we have to wait before angular process playwords directive
				
				let d = that.psn;
				d.origin_text = '';
				d.compileSentence();
				d.end_callback = ()=>{
					that.playsentenceEndCallback();
				}
				
			}, 20);
			
    		
		} else {
			this.uinputph = 'finish';
			this.showResults();
			//this.enter();
		}
	}

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

	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			//this.playCorrectSound();
			this.enableNextCard();
			this.moveNext();
		} else {
			//playmedia.sound('_STNQR', function(){});
		}
	}

	repeat() {
		if(this.uinputph === 'finish'){
			this.playCorrectSound();
			this.enableNextCard();
			this.moveNext();
			return;
		}
		
		this.playContentDescription();
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
			this.psn.compileSentence();
		}
		
	}

	setFocus(){
		
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		this.playSentenceFinish();
		if(typeof this.card.content[0].LoopInst !== 'undefined' && this.card.content[0].LoopInst.length > 0){
			this.card.content[0].desc = this.card.content[0].LoopInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.playmedia.sound(this.card.content[0].LoopInst[0].audio, function(){
				that.blinkAP();
			});
		}
	}

	//	Answer placeholder blinking cycle
	blinkAP(r = false) {
		let rght = r || false;
		let cls = 'gwf_ap_hilite';
		if(rght) cls = 'gwf_ap_hilite_r';
		let that = this;
		setTimeout(function(){
			that.elm.nativeElement.querySelector('.gwf-ap-mark').classList.add(cls);
			setTimeout(function(){
				that.elm.nativeElement.querySelector('.gwf-ap-mark').classList.remove(cls);
				setTimeout(function(){
					that.elm.nativeElement.querySelector('.gwf-ap-mark').classList.add(cls);
					setTimeout(function(){
						that.elm.nativeElement.querySelector('.gwf-ap-mark').classList.remove(cls);
					}, 400);
				}, 400);
			}, 400);
		}, 400);
	}

	showRightAnswer(){
		this.elm.nativeElement.querySelector('.gwf-answer-right').style.display = 'block';
	}

	showUserAnswer() {
		this.elm.nativeElement.querySelector('.gwf-answer-wrong').style.display = 'block';
	}

	playSentenceFinish() {
		//this.showNextSentence();
		let that = this;
		if(!this.elm.nativeElement.querySelector('.gwf-answer-placeholder') || 
			this.elm.nativeElement.querySelector('.gwf-answer-placeholder').innerText !== '...')
				setTimeout(function(){ that.showNextSentence(); }, 700);
	}

	playSentence(){
		let that = this;
		this.psn.playSentenceByIndex(this.sentence_index, ()=>{
			that.playSentenceFinish.call(that);
		});
	}

	public user_answer_received_flag: boolean = false;
	addAnswer(w) {
		let that = this;
		if(this.user_answer_received_flag) return;
		this.user_answer_received_flag = true;

		this.input_data = w;
		this.answers.push(w);

		//	Check if answer right or not
		if(w.toLowerCase() === this.expected[this.current_set].toLowerCase()){
			this.playmedia.action('DING', function(){});
			this.showRightAnswer();
			this.elm.nativeElement.querySelector('.gwf-answer-placeholder').style.width = 'auto';
			this.elm.nativeElement.querySelector('.gwf-answer-placeholder').innerText = w;
			setTimeout(function(){ 
				that.psn.origin_text = that.card.content[0].parts[that.current_set].title.replace(/\(/ig, '').replace(/\)/ig, ''); 
				that.psn.compileSentence(); 
				setTimeout(()=>{ that.playSentence(); }, 10);
			}, 1400);
		} else {
			//	Logging wrong answer
			this.result();
			//	Play wrong sound and show right answer
			this.playmedia.action('CHONG', function(){
				that.blinkAP(true);
				that.elm.nativeElement.querySelector('.gwf-answer-placeholder').style.width = 'auto';
				that.elm.nativeElement.querySelector('.gwf-answer-placeholder').innerText = that.expected[that.current_set];
				setTimeout(function(){
					that.psn.origin_text = that.card.content[0].parts[that.current_set].title.replace(/\(/ig, '').replace(/\)/ig, '');
					that.psn.compileSentence();
					setTimeout(()=>{ that.playSentence(); }, 10);
					
				}, 1400);
			});
			this.showRightAnswer();
			this.showUserAnswer();

		}

		
	}

	showResults(){
		for(let i in this.answers){
			let a = this.answers[i];
			let e = this.expected[i];
			if(a === e) this.display_result.right++;
			else this.display_result.wrong++;
		}

		this.card.content[0].desc = '';

		

		this.elm.nativeElement.querySelector('.gwf-variants-wrap').style.display = 'none';
		this.elm.nativeElement.querySelector('.gwf-sentence-wrap').style.display = 'none';
		this.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';

		//	Play chimes
		//this.playmedia.action('CHIMES', function(){
			
		//}, 300);
		let that = this;
		this.playCorrectSound(()=>{
			that.enter();
		})

	}


	//	This function used to catch moment when sentence is completed (user selected answer)
	//	and student click on a sentence to play it. After clicking, the default callback, which was sent 
	//	to playsentence directive, will be removed, so we need manualy control when student complete current
	//	sentence and switch to another or finish the card. For this purpose we will use 'end' attribute 
	//	of playsentence directive.
	playsentenceEndCallback(){
		//let that = this;
		//if(this.elm.nativeElement.querySelector('.gwf-answer-placeholder').innerText !== '...')
		//	setTimeout(function(){ that.showNextSentence(); }, 700);
	}

	ngDoCheck() {}

}