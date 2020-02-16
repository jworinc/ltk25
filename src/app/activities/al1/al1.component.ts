import { Component, OnInit, Input, ElementRef, IterableDiffers, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-al1',
  templateUrl: './al1.component.html',
  styleUrls: ['./al1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Al1Component extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, differs: IterableDiffers, private al1log: LoggingService, private al1cs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, al1log, al1cs);
  	//this.differ = differs.find([]).create(null);
  }

  ngOnInit() {
  	this.setHeader();
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
  	this.setCardNumber();
	//this.setCardId();

	//	Add card data to directive scope
	this.card = this.data;

	//	Set current card header
	this.current_header = this.card.header;
	
	//	Data format for AL1
	//	In DB parts array will empty, because for AL1 cards there are no letiety of content
	//	content will the same for all AL1 cards, and it is hard coded in directive
	/*this.card.content = [{
		desc: 'Please enter the two missing letters in a 4-letter alphabet sequence above.',
		parts: [

			{ letter: '', expected: 'A' },
			{ letter: '', expected: 'B' },
			{ letter: '', expected: 'C' },
			{ letter: '', expected: 'D' },

			 ------------------------

			{ letter: '', expected: 'Z' }

		]
	}]*/

	this.card.content[0].parts = [
		{ letter: '', expected: 'A', disabled: false, mark: {} },
		{ letter: '', expected: 'B', disabled: false, mark: {} },
		{ letter: '', expected: 'C', disabled: false, mark: {} },
		{ letter: '', expected: 'D', disabled: false, mark: {} },
		{ letter: '', expected: 'E', disabled: false, mark: {} },
		{ letter: '', expected: 'F', disabled: false, mark: {} },
		{ letter: '', expected: 'G', disabled: false, mark: {} },
		{ letter: '', expected: 'H', disabled: false, mark: {} },
		{ letter: '', expected: 'I', disabled: false, mark: {} },
		{ letter: '', expected: 'J', disabled: false, mark: {} },
		{ letter: '', expected: 'K', disabled: false, mark: {} },
		{ letter: '', expected: 'L', disabled: false, mark: {} },
		{ letter: '', expected: 'M', disabled: false, mark: {} },
		{ letter: '', expected: 'N', disabled: false, mark: {} },
		{ letter: '', expected: 'O', disabled: false, mark: {} },
		{ letter: '', expected: 'P', disabled: false, mark: {} },
		{ letter: '', expected: 'Q', disabled: false, mark: {} },
		{ letter: '', expected: 'R', disabled: false, mark: {} },
		{ letter: '', expected: 'S', disabled: false, mark: {} },
		{ letter: '', expected: 'T', disabled: false, mark: {} },
		{ letter: '', expected: 'U', disabled: false, mark: {} },
		{ letter: '', expected: 'V', disabled: false, mark: {} },
		{ letter: '', expected: 'W', disabled: false, mark: {} },
		{ letter: '', expected: 'X', disabled: false, mark: {} },
		{ letter: '', expected: 'Y', disabled: false, mark: {} },
		{ letter: '', expected: 'Z', disabled: false, mark: {} },
	];

	//	Add content data to markup
	this.input_data = this.card.content[0].parts;
	this.old_input_data = JSON.stringify(this.input_data);

  }

  	public differ: any;

  	//	Set header for current card
	public current_header = '';
	
	//	Show remains letters which user must to enter
	public message = '';

	//	Default hint level
	public current_hint_level = 0;
	
	public max_hint_level = 2;

	public hint_letter = '';

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	public card: any;
	public input_data: any;
	public last_user_letter: string;
	public last_expected_letter: string;
	public card_object: string;
	public card_instance: string;
	
	//	Page ready callback
	//$rootScope.$on('rootScope:pageready', function (event, data) {
		//	If current card is active
	//	if(this.isActive()){
			//	Set focus on first expected input element
	//		this.setFocus();
	//	}

	//});

	//	Prevent performing of show function twice in some cases
	public prevent_dubling_flag: boolean = false;

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			this.clearUserInput(true);
			if(!this.validate()){
				//	Set focus on first empty input element
				//this.setFocus();
				//	Play card description
				this.playCardDescription();
				this.disableNextSlide();
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.inp_data_watcher_doubling = false;
			this.showHint();
		}
		
	}

	next() {
		this.enter();
		if(this.validate()){
			this.enableNextSlide();
			this.moveNext();
		}
	}

	//	Callback for hide card event
	hidden() {
		if(!this.isActive() && this.prevent_dubling_flag)
			this.prevent_dubling_flag = false;
	} 

	//	Validation of user input
	validate() {
		//	If current card is active on screen
		if(this.isActive()){
			//	Set focus on first empty input element
			//this.setFocus();
		}
		
		//	Count remains letters, play audio for right answers and mark wrong answers
		let remains = 0;
		for(let i in this.input_data) {

			let d = this.input_data[i];
			let intex = +i;

		    //	If input letter is empty or wrong add quantity of the remains message
			if(d.letter == '' || d.letter !== d.expected) remains++;
			//	If letter entered right, disable it for further edit and play appropriate sound
			if(!d.disabled && d.letter === d.expected) {
				d.disabled = true;
				this.playmedia.word(d.letter, function(){}, 0);
			}
			//	If input letter is wrong, mark it with light coral color
			if(!d.disabled && d.letter !== '' && d.letter !== d.expected) {
				//	Check for newly entered letter
				//if(typeof d.mark["background-color"] === 'undefined'){
					//	Logging user input errors
					this.last_user_letter = d.letter;
					this.last_expected_letter = d.expected;
					this.card_object = 'letter';
					this.card_instance = d.expected;
					this.result();


					this.clearUserInput();
					this.setFocus();
					this.playmedia.stop();
					this.playmedia.action('DING', function(){}, 30);

				//}
				//d.mark = {
				//	'background-color': 'lightcoral'
				//};
			} else {
				d.mark = {};
			}

		};

		//	If all letters are entered right, remore the remains message and return success result of validation
		if(remains === 0){
			this.message = '';
			return true;
		} else {
			//	Set the remains message
			if(remains === 1) {
				//	For one letter
				this.message = 'Remains 1 letter.';
			} else {
				//	For few letters
				this.message = 'Remains '+remains+' letters.';
			}
			this.setFocus();
			//	Return fail result of validation
			return false;

		}

	}


	//	Create formated user input string for errors log
	getUserInputString() {
		return this.last_user_letter;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.last_expected_letter;
	}


	//	Set focus on first empty input
	setFocus() {
		let set_focus = false;
		this.elm.nativeElement.querySelectorAll('input[data-pos]').forEach((e)=>{
			if(e.value == "") e.removeAttribute('disabled');
		});
		//	Iterate over all input elements
		for(let i in this.input_data){

			let d = this.input_data[i];
			let index = +i;

		    //	If letter is empty and focus is not setted yet
			if(!set_focus && d.letter == ''){
				set_focus = true;
				//let inps = $element.find('input[data-pos="'+index+'"]');
				let inps = this.elm.nativeElement.querySelector('input[data-pos="'+index+'"]');
				//	Small delay which allow Angular to rebuid page markup before focus set
				setTimeout(function() { inps.focus(); }, 30);
				continue;
			}
			else if(set_focus && d.letter == '') {
				let inps = this.elm.nativeElement.querySelector('input[data-pos="'+index+'"]');
				if(inps) inps.setAttribute('disabled', true);
			}

		};

		//	If focus is not setted to any element, remove it manualy from all input elements
		if(!set_focus){
			this.elm.nativeElement.querySelector('input[data-pos]').blur();
		}

	}

	//	Filter user input
	al2filter(inp) {
		if(inp === "") return "";
		let out = inp.toUpperCase();
		return out.split('')[0];
	}

	//	Play letter sound
	playLetter(i) {
		let d = this.input_data[i];
		if(d.letter === d.expected) {
			this.playmedia.word(d.letter, function(){}, 0);
		}
	}

	//	Handle letter focus callback, performs when input element receive focus
	handleLetterFocus(i) {
		let d = this.input_data[i];
		//	If input letter is right, remove focus, else clear letter
		if(d.letter === d.expected) {
			this.elm.nativeElement.querySelector('[data-pos="'+i+'"]').blur();
		} else {
			d.letter = '';
		}
	}
	
	//	Clear wrong inputs
	clearUserInput(all = false) {
		let parts = [];
		let that = this;
		if(typeof this.card !== 'undefined' && this.card.content !== 'undefined' && this.card.content.length > 0){
			parts = this.card.content[0].parts;
		}
		
		//	Clear letters that was entered by user
		for(let i in this.input_data){
			let d = this.input_data[i];
			let index = +i;
			if(parts.length > 0 && parts[index].expected !== '' && parts[index].expected !== d.letter){
				this.input_data[index].letter = '';
			}
			else if(all) {
				this.input_data[index].letter = '';
				this.input_data[index].disabled = false;
			}
		};

		//	Bind to input elems
		this.elm.nativeElement.querySelectorAll('.card-content-body-wrap-al1 input').forEach((e)=>{
			let i = parseInt(e.getAttribute('data-pos'));
			e.value = that.input_data[i].letter;
		});

		setTimeout(()=>{ that.validate(); that.setFocus(); }, 100);

	}

	getLastNotEnteredLetter() {

		let out = '';

		for(let i in this.input_data) {

			let d = this.input_data[i];
			
		    //	If input letter is empty or wrong, clear this letter and return it
			if(d.letter == '' || d.letter !== d.expected) {
				out = d.expected;
				d.letter = '';
				break;
			}
			

		};
		return out;
	}

	hintLevel1() {
		let l = this.getLastNotEnteredLetter();
		let scope = this;
		if(l !== '') {
			this.playmedia.word(l, function(){ scope.hint_busy = false; }, 0);
			setTimeout(function(){ scope.hint_letter = ''; scope.setFocus(); }, 2000);
		}
	}

	hintLevel2() {
		let l = this.getLastNotEnteredLetter();
		let scope = this;
		if(l !== '') {
			this.playmedia.word(l, function(){ scope.hint_busy = false; scope.setFocus(); }, 0);
			this.hint_letter = l;
			setTimeout(function(){ scope.hint_letter = ''; scope.setFocus(); }, 2000);
		}
	}


	public hint_busy: boolean = false;
	hint() {
		if(this.hint_busy) return;
		this.hint_busy = true;
		this.current_hint_level++;
		if(this.current_hint_level > this.max_hint_level) this.current_hint_level = this.max_hint_level;
		if(this.current_hint_level === 1) this.hintLevel1();
		else if(this.current_hint_level === 2) this.hintLevel2();
		//else if(this.current_hint_level === 3) this.hintLevel3();
		
	};

	public inp_data_watcher_doubling: boolean = false;

	//	Watch if user type any data
	//ngDoCheck() {
	onUserInput(inp, ki) {

			//	Perform check for doubles and remove extra letters
			inp.currentTarget.value = inp.currentTarget.value.substr(0, 1).toUpperCase();
			this.input_data[ki].letter = inp.currentTarget.value;

	    //const change = this.differ.diff(this.input_data);
	    //if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){
		if(this.isActive()){
	    	
	    	console.log('collection changed');
			
			if(this.input_data[ki].letter !== this.input_data[ki].expected) {
				/*
				this.clearUserInput();
				this.setFocus();
				this.playmedia.stop();
				this.playmedia.action('DING', function(){}, 30);
				*/
			}

	    	for(let i in this.input_data){
	    		let d = this.input_data[i];
	    		let index = +i;
	    		this.input_data[index].letter = this.al2filter(d.letter);
	    	}

	    	//this.old_input_data = JSON.stringify(this.input_data);

	    	let scope = this;
			//	Validate user input and decide to enable next card or not
			if(scope.validate() && !this.inp_data_watcher_doubling) {
				//this.inp_data_watcher_doubling = true;
				scope.enableNextSlide();
				
				setTimeout(function(){ scope.playCorrectSound(()=>{ scope.moveNext(); }) }, 1000);

			}
			else {
				this.setFocus();
				scope.disableMoveNext();
			}

	    }
	    
	}




}