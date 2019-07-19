import { Component, OnInit, ViewEncapsulation, Input, HostBinding, ElementRef, EventEmitter, Output } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CardComponent } from '../../components/card/card.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { max } from 'rxjs/operators';

@Component({
  selector: 'app-base',
  template: ``,
  styleUrls: []
})
export class BaseComponent implements OnInit, CardComponent {

	public _cpos: number;
	public _mode: string;
	public _scale: number;
	public display_state: string = 'closed';
	public card: any;
	public nav_style_prev: any = {
		'width': '0',
		'height': '0',
	}
	public nav_style_next: any = {
		'width': '0',
		'height': '0',
	}
	public current_presented = 1;
	public max_presented = 1;
	public sp = {
		mediastorage: 'https://lessons.ltk.cards'
	};
	public lastUncomplete: any = null;

	public blinknext: boolean = false;
	public card_begin_flag: boolean = false;
	public prevent_dubling_flag: boolean = false;
	public current_card_instance = 0;
	public card_object: any;
	public card_instance: any;
	public enter_trottle: boolean = false;
	public old_input_data: any = '';
	public activity_log_sent: boolean = false;
	public errors_log = [];
	public activity_log_timer: any;
	public current_hint_level = 0;
	public complete = 0;
	public max_repetitions = 10;

    @Input() data: any;
    @Input() default_waves: any;
    @Input() global_recorder: boolean;
    @Input() recstart_event: any;
	@Input() recstop_event: any;
	@Input() playstart_event: any;
	@Input() playstop_event: any;
	@Input() good_btn: any;
	@Input() bad_btn: any;
	@Input() prev_btn: any;
	@Input() sidetripmode: boolean;
	@Input() global_start: boolean;


	@Input('cpos')
	set cpos(cpos: number) {
	   this._cpos = cpos;
	   this.render();
	}
	get cpos(): number { return this._cpos; }

	@Input('mode')
	set mode(mode: string) {
	   this._mode = mode;
	}
	get mode(): string { return this._mode; }

	@Input('scale')
	set scale(scale: number) {
	   this._scale = scale;
	}
	get scale(): number { return this._scale; }

	@Output() mnext = new EventEmitter<boolean>();
	@Output() mprev = new EventEmitter<boolean>();
	@Output() blinkenter = new EventEmitter<boolean>();
	@Output() blinknextnavbtn = new EventEmitter<boolean>();
	@Output() blink_good_bad = new EventEmitter<boolean>();
	@Output() blinkrec = new EventEmitter<boolean>();
	@Output() blinkplay = new EventEmitter<boolean>();
	@Output() option_hide = new EventEmitter<boolean>();
	@Output() show_good_bad = new EventEmitter<boolean>();
	@Output() show_hint = new EventEmitter<boolean>();
	@Output() show_prev = new EventEmitter<boolean>();
	@Output() show_clear = new EventEmitter<boolean>();
	@Output() set_card_id = new EventEmitter<number>();
	@Output() disable_next_slide = new EventEmitter<boolean>();
	@Output() enable_next_slide = new EventEmitter<boolean>();
	@Output() set_global_desc = new EventEmitter<any>();
	@Output() set_global_header = new EventEmitter<any>();
	@Output() set_default_header = new EventEmitter<any>();

  constructor(private el:ElementRef, private sn: DomSanitizer, private pm: PlaymediaService, private logging: LoggingService, private cs: ColorschemeService) { 
	  this.sp.mediastorage = pm.getMediaStorage();
   }


	@HostBinding('style.transition') host_transition: SafeStyle = this.sn.bypassSecurityTrustStyle('transform 0s ease-out');
	@HostBinding('style.transform') host_transform: SafeStyle = this.sn.bypassSecurityTrustStyle('translate(-1700px, 0) scale(1, 1)');
	@HostBinding('style.opacity') host_opacity: SafeStyle = this.sn.bypassSecurityTrustStyle('0');
	@HostBinding('style.zIndex') host_zindex: SafeStyle = this.sn.bypassSecurityTrustStyle(String(2000));
	@HostBinding('style.left.px') host_left: SafeStyle = this.sn.bypassSecurityTrustStyle(String(0));
	//@HostBinding('style.backgroundColor') host_bgcolor: SafeStyle = this.sn.bypassSecurityTrustStyle('white');
	@HostBinding('class.bookwrapperactive') host_bookWrapperActive: boolean = false;
	@HostBinding('attr.data-location') host_dataLocation: string = '';


  ngOnInit() {
  }

  // Return current width of cards block
  getCurrentWidth() {
	let w = this.el.nativeElement.parentNode.parentElement.clientWidth;
	return w;
  }

  // Return current height of cards block
  getCurrentHeight(){
	let w = this.el.nativeElement.parentNode.parentElement.clientHeight;
	return w;
  }
  

  render() {
  	//console.log('render: position - ' + this._cpos + " my position - " + this.data.pos);

  	//	Calc css left propertie of each card, so it moves to the right or left with animation
	let scwidth = this.getCurrentWidth();
	let left = (this.data.pos - this._cpos) * scwidth;
	if(left > scwidth * 2) left = scwidth * 2;
	if(left < scwidth * (-1)) left = scwidth * (-1);
	let left_str = left + 'px';
	

	//	Showing and animating cards
	
	//	Single card mobile design	
	let that = this;
	let scale = this._scale;
	if(this._mode === 'single'){
		
		if(this.data.pos < this._cpos){ // && this.display_state !== 'opened'
			
			setTimeout(()=>{ that.host_transition = that.sn.bypassSecurityTrustStyle('transform 0.2s ease'); }, 30);
			this.host_transform = this.sn.bypassSecurityTrustStyle('translate(-1700px, 0) scale('+scale+', '+scale+')');
			this.display_state = 'opened';
			//console.log(this.data.pos + ' ----> ' + this.display_state);
			
		} 
		else if(this._cpos < 0 || (this.data.pos >= this._cpos + 2)) { // && this.display_state !== 'closed'
			
			setTimeout(()=>{ that.host_transition = that.sn.bypassSecurityTrustStyle('transform 0s ease-out'); }, 30);
			this.host_transform = this.sn.bypassSecurityTrustStyle('translate(-1700px, 0) scale('+scale+', '+scale+')');
			this.host_opacity = this.sn.bypassSecurityTrustStyle('0');
			this.display_state = 'closed';
			//console.log(this.data.pos + ' ----> ' + this.display_state);
			
		}
		else if(this._cpos >= 0 && (this.data.pos >= this._cpos && this.data.pos < this._cpos + 2)) { // && this.display_state !== 'showed'
			
			this.host_transform = this.sn.bypassSecurityTrustStyle('translate(0, 0) scale('+scale+', '+scale+')');
			setTimeout(()=>{ that.host_opacity = '1'; that.host_transition = that.sn.bypassSecurityTrustStyle('transform 0.2s ease'); }, 30);
			this.display_state = 'showed';
			//console.log(this.data.pos + ' ----> ' + this.display_state);
			
		}

		if(this.data.pos === this._cpos) {
			this.host_bookWrapperActive = true;
		} else {
			this.host_bookWrapperActive = false;
		}

		this.host_zindex = this.sn.bypassSecurityTrustStyle(String(2050 - this.data.pos));
		//this.host_bgcolor = this.sn.bypassSecurityTrustStyle(this.cs.getCardBgColor());
		this.el.nativeElement.querySelector('.card-block-item').style.backgroundColor = this.cs.getCardBgColor();
	}

	//	Slide design for tablet and desktop	

	if(this._mode === 'dual'){

		let scale_for_back_cards = scale * 0.47;
		let scale_for_front = scale;
		let container_width = this.getCurrentWidth();
		let card_width = this.el.nativeElement.querySelector('.card-block-item').clientWidth;
		let card_height = this.el.nativeElement.querySelector('.card-block-item').clientHeight;
		let max_left_for_back = card_width * scale_for_back_cards;
		let curr_left_for_back = ((container_width - card_width) / scale_for_back_cards) * 0.65;
		if(curr_left_for_back > max_left_for_back) curr_left_for_back = max_left_for_back;
		if(this.data.pos !== this._cpos+1 && this.data.pos !== this._cpos-1){	
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(left));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('0');
			this.host_transform = this.sn.bypassSecurityTrustStyle(String('scale('+scale_for_back_cards+', '+scale_for_back_cards+')'));
			this.host_dataLocation = '';

		}
		if(this.data.pos === this._cpos+1){
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(curr_left_for_back));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('100');
			this.host_transform = this.sn.bypassSecurityTrustStyle(String('scale('+scale_for_back_cards+', '+scale_for_back_cards+')'));
			this.host_dataLocation = 'next';

		}
		if(this.data.pos === this._cpos-1){
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(curr_left_for_back*(-1)));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('100');
			this.host_transform = this.sn.bypassSecurityTrustStyle(String('scale('+scale_for_back_cards+', '+scale_for_back_cards+')'));
			this.host_dataLocation = 'prev';

		}
		if(this.data.pos === this._cpos){
			
			this.host_left = this.sn.bypassSecurityTrustStyle(String(left));
			this.host_zindex = this.sn.bypassSecurityTrustStyle('2050');
			this.host_transform = this.sn.bypassSecurityTrustStyle(String('scale('+scale_for_front+', '+scale_for_front+')'));
			this.host_dataLocation = '';

			this.nav_style_prev = {
				'width': card_width*0.47 + 'px',
				'height': card_height*0.47 + 'px',
				'margin-left': '-' + ((card_width*0.54)/2 + (curr_left_for_back/scale)*1.065) + 'px',
				'margin-top': '-' + ((card_height*0.47)/2) + 'px'
			};
			this.nav_style_next = {
				'width': card_width*0.47 + 'px',
				'height': card_height*0.47 + 'px',
				'margin-left': ((card_width*0.54*(-1))/2 + (curr_left_for_back/scale)*1.065) + 'px',
				'margin-top': '-' + ((card_height*0.47)/2) + 'px'
			}
			
		}

		if(left === 0) {
			this.host_bookWrapperActive = true;
		} else {
			this.host_bookWrapperActive = false;
		}

		this.host_opacity = this.sn.bypassSecurityTrustStyle('1');
		this.host_transition = this.sn.bypassSecurityTrustStyle('all 0.4s ease');
		//this.host_bgcolor = this.sn.bypassSecurityTrustStyle(this.cs.getCardBgColor());
		this.el.nativeElement.querySelector('.card-block-item').style.backgroundColor = this.cs.getCardBgColor();
	}

	//	Check if card is current card
	if(this.data.pos === this._cpos) {

		//	Change header according to current card
		this.setHeader();
		
		//	Change title
		this.setTitle();
		this.setSubtitle();

		//	Change card number
		this.setCardNumber();

		this.setCardId();

		//	Check if card was not fully complete, reset activity sent flag
		if(this.complete < 100) this.activity_log_sent = false;

		setTimeout(()=>{

			//	Logging comand begin
			if(typeof that.card.activity !== 'undefined' && typeof that.card.position !== 'undefined' && that.global_start && !that.card_begin_flag && !that.activity_log_sent){
				that.activity_log_timer = setTimeout(function(){ 
					that.card_begin_flag = true;
					//	Check if we not in sidetrip mode 
					if(!that.sidetripmode){
						that.logging.commandBegin(that.card.activity, that.card.position)
							.subscribe(
					            data => {},
					            error => {
					              console.log(error);
					              alert('Command Begin save error');
					            }
					          );
					}
				}, 300);
			}

			that.checkForHeader();
			that.show(); 
		}, 3);

		
		/*
		if(typeof this.show !== 'undefined' && this.$parent.global_start){
			let scope = this;
			setTimeout(function(){
				scope.show();
			}, 100);
		}
		*/
	}


  }



  moveNext() {
		this.enableNextSlide();
  	this.mnext.emit();
  }

  movePrev() {
  	this.mprev.emit();
  }

  setHeader() {

  }

  setTitle() {

  }

  setSubtitle() {

  }

  setCardNumber() {

  }

  setCardId() {
  	this.set_card_id.emit(this.data.id);
  }

  isActive() {
	return this.data.pos === this._cpos;
  }

  validate() {
	return true;
  }

  enableMoveNext() {
  	this.enableNextSlide();
  	this.complete = 100;
  	console.log('Card ' + this.card.activity + ' is complete!');
  }

  disableMoveNext() {

  }

  disableNextSlide() {
  	this.disable_next_slide.emit();
  }

  enableNextSlide() {
  	this.enable_next_slide.emit();
  }

  blinkNextNavButtons() {

  		let that = this;
  		this.blinknextnavbtn.emit();
  		
	    setTimeout(()=>{
	      that.blinknext = true;
	      setTimeout(()=>{
	        that.blinknext = false;
	        setTimeout(()=>{
	          that.blinknext = true;
	          setTimeout(()=>{
	            that.blinknext = false;
	          }, 400);
	        }, 400);
	      }, 400);
	    }, 400);
  }

  blinkOnlyNext() {
  	this.blinknextnavbtn.emit();
  }

  enableNextCard() {
  		if(this.isActive()){
			
			if(this.validate()){
				this.enableMoveNext();
				this.blinkNextNavButtons();
			}
			else this.disableMoveNext();
			
			
		}
  }

  optionHide() {
  	this.option_hide.emit();
  }

  showGoodBad() {
  	this.show_good_bad.emit();
  }

  showHint() {
  	this.show_hint.emit();
	}
	
	showPrev() {
  	this.show_prev.emit();
  }

  showClear() {
  	this.show_clear.emit();
  }

  setGlobalDesc(d: any) {
  	this.set_global_desc.emit(d);
  }

  setGlobalHeader(h: any) {
  	this.set_global_header.emit(h);
  }

  blinkEnter() {
  	this.blinkenter.emit();
  }

  playCorrectSound(cb: any = ()=>{}) {
  	if(typeof this.default_waves === 'undefined' || typeof this.default_waves.RespIfCorrect === 'undefined') return;
  	//	Get default random set of correct sound
	let i = this.default_waves.RespIfCorrect[Math.floor(Math.random() * (this.default_waves.RespIfCorrect.length - 1))];
	//	Set description
	this.card.content[0].desc = i.pointer_to_value;
	this.setGlobalDesc(i.pointer_to_value);
	//	Play sound
	if(typeof i.audio !== 'undefined' && i.audio !== '')
		this.pm.sound(i.audio, cb, 1);
  }

  show() {

  }

  setFocus() {

  }

  	playContentDescription() {

	}
	
	//	Play card description
	public play_card_description_busy = false;
	public current_description = 0;
	handleNextCardDescription() {
		let that = this;
		let i = this.card.content[0].instructions[this.current_description];
		this.card.content[0].desc = i.pointer_to_value;
		this.setGlobalDesc(i.pointer_to_value);
		
		if(typeof i.audio !== 'undefined' && i.audio !== ''){

			this.pm.sound(i.audio, function(){ 
    			that.current_description++;
    			if(that.current_description < that.card.content[0].instructions.length){
					that.handleNextCardDescription();
				} else {
					that.play_card_description_busy = false; that.validate(); that.setFocus();
					that.playContentDescription();
				}
    		}, 300);

		} else {
    		setTimeout(function(){
    			that.current_description++;
    			if(that.current_description < that.card.content[0].instructions.length){
					that.handleNextCardDescription();
				} else {
					that.play_card_description_busy = false; that.validate(); that.setFocus();
					that.playContentDescription();
				}
    				
    			
    		}, 4000);
    	}
	}
	
	playCardDescription(){
		if(this.play_card_description_busy) return;
		this.play_card_description_busy = true;
		this.current_description = 0;
		this.pm.stop();
		if(typeof this.card !== 'undefined' && typeof this.card.content[0].instructions !== 'undefined' && this.card.content[0].instructions.length > 0){
			this.handleNextCardDescription();
		}
		else if(typeof this.card !== 'undefined' && typeof this.card.content[0].instructions !== 'undefined' && this.card.content[0].instructions.length === 0){
			this.playContentDescription();
		}
		 
	};
	
	blinkWord() {
		let that = this;
		setTimeout(function(){
			that.el.nativeElement.querySelector('.bw1-word').style.backgroundColor = 'rgba(100, 255, 100, 0.7)';
			setTimeout(function(){
				that.el.nativeElement.querySelector('.bw1-word').style.backgroundColor = '#C69C6D';
				setTimeout(function(){
					that.el.nativeElement.querySelector('.bw1-word').style.backgroundColor = 'rgba(100, 255, 100, 0.7)';
					setTimeout(function(){
						that.el.nativeElement.querySelector('.bw1-word').style.backgroundColor = '#C69C6D';
					}, 400);
				}, 400);
			}, 400);
		}, 400);
		
	}

	blinkRec() {
		this.el.nativeElement.querySelectorAll('input').forEach((e)=>{
			e.blur();
    	});
		this.blinkrec.emit();
	}

	blinkPlay(){
		this.blinkplay.emit();
	}

	getUserInputString(){
		return '';
	}

	getExpectedString(){
		return '';
	}

	result() {
		if(this.getUserInputString() === '') return;
		let res = {Expected: 'none', actual_input: 'none', HintLevel: 0, card_object: 'not defined', card_instance: 'not defined'};
		if(typeof this.getExpectedString !== 'undefined') res.Expected = this.getExpectedString();
		if(typeof this.getUserInputString !== 'undefined') res.actual_input = this.getUserInputString();
		if(typeof this.current_hint_level !== 'undefined') res.HintLevel = this.current_hint_level;
		if(typeof this.card_object !== 'undefined') res.card_object = this.card_object;
		if(typeof this.card_instance !== 'undefined') res.card_instance = this.card_instance;
		this.errors_log.push(res);
		this.increaseMaxPresented();
	}

	clearUserInput() {

	}

	enter(silent = false) {
		let that = this;
		this.pm.stop();
		if(!this.validate()){
			if(!silent && this.getUserInputString() !== ''){
				this.pm.sound('_STNQR', function(){ 
					 that.result(); that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; //scope.playCardDescription();
				}, 0);
			} 
			else if(!silent && this.getUserInputString() === ''){
				this.repeat();
			}
			else {
				that.result(); that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; //scope.playCardDescription();
			}
		} else {

			//	Check if we shown all card instances
			if(that.current_presented >= that.max_presented){
				if(!silent && this.getUserInputString() !== ''){
					this.playCorrectSound(function(){ 
						that.enableNextCard();
					});
				} else {
					that.enableNextCard();
				}
			}
		}
	}

	//	Pre hide event hook
	prehide(){
		this.pm.stop();
		this.play_card_description_busy = false;
		this.setGlobalDesc('');
		//	Clear activity log timer, to prevent sending many begin tags when user switch cards very fast (less than 2sec)
		clearTimeout(this.activity_log_timer);

		this.card_begin_flag = false;

	}

	//	Callback for hide card event
	hide() {
		this.prevent_dubling_flag = false;

		//	Stop play, reset stop play cycle
		this.pm.stop();
		//clearTimeout(this.play_stop_cycle_timer);
		this.play_card_description_busy = false;
		//	Hide option buttons
		this.optionHide();
	}

	repeat() {
		let that = this;
		this.play_card_description_busy = false;
		if(typeof this.card.content[0].RepInst !== 'undefined' && this.card.content[0].RepInst.length > 0){
			
			var i = this.card.content[0].RepInst[0];
			this.card.content[0].desc = i.pointer_to_value;
			this.setGlobalDesc(i.pointer_to_value);
			if(typeof i.audio !== 'undefined' && i.audio !== ''){

				this.pm.sound(i.audio, function(){

					if(that.card.content[0].RepInst.length > 1){

						var i = that.card.content[0].RepInst[1];
		    			that.card.content[0].desc = i.pointer_to_value;
						that.setGlobalDesc(i.pointer_to_value);
						if(typeof i.audio !== 'undefined' && i.audio !== ''){

			    			that.pm.sound(i.audio, function(){ that.validate(); that.setFocus(); }, 1);

			    		} else {
							that.validate(); that.setFocus();
						}

					} else {
						that.validate(); that.setFocus();
					}

				}, 1);

			} else {
				this.validate(); this.setFocus();
			}
	    	
		} else {
			this.playCardDescription();
		}
		
	}

	hint() {

	}

	clear() {

	}
	
	eslCustomInstructions(name, cb=()=>{}){
		this.pm.stop();
		let ib = [];
		let that = this;
		let callback = cb;
		function nextInstruction(){
			if(ib.length <= 0) return;
			that.card.content[0].desc = ib.shift();
			that.setGlobalDesc(that.card.content[0].desc);
		}
		for(let i in this.card.content[0][name]){
			let a = this.card.content[0][name][i];
			ib.push(a.pointer_to_value);
			if(typeof a.audio !== 'undefined' && a.audio !== ''){
				//	Check if last
				if(parseInt(i) >= this.card.content[0][name].length - 1){
					this.pm.sound(a.audio, function(){
	    				callback();
	    			});
				} else {
					this.pm.sound(a.audio, function(){
	    				nextInstruction();
	    			}, 300);
				}
    			
    		} else {
    			//this.showQuestion();
    		}
		}
		nextInstruction();
	}

	checkForHeader() {
		if(typeof this.card !== 'undefined' && 
				typeof this.card.content !== 'undefined' &&
				typeof this.card.content.length !== 'undefined') {

			//	Get first content item
			let c = this.card.content[0];

			//	Check for header
			if(typeof c.Header !== 'undefined' && typeof c.Header.length !== 'undefined'){
				this.setGlobalHeader(c.Header[0].pointer_to_value);
			}
			//	Check for Cmd01 in Syp activity
			else if(typeof c.Cmd01 !== 'undefined' && typeof c.Cmd01.length !== 'undefined' &&
								c.Cmd01.length > 0 && typeof c.Cmd01[0].header !== 'undefined'){
				this.setGlobalHeader(c.Cmd01[0].header);
			}
			else {
				this.setDefaultHeader();
			}
			
		}
	}

	setDefaultHeader() {
		this.set_default_header.emit();
	}

	getMaxPresented(max, op) {
		let qp = parseInt(op.quickpace);
		let exp = parseInt(op.expertlevel);
		let rl = parseInt(op.replevel);
		let max_presented = 1;
		//	Quick pace off (inverted!)
		if(qp === 1){
			//	Check if we have max content samples
			if(max >= 4){
				if(exp === 0 || exp === 1) max_presented = 4;
				if(exp === 2 || exp === 3) max_presented = 3;
				if(exp === 4) max_presented = 2;
			} else {
				if(exp === 0 || exp === 1) max_presented = max;
				if(exp === 2 || exp === 3) max_presented = max - 1;
				if(exp === 4) max_presented = 1;
			}
		}
		//	Quik pace on
		else {
			//	Check if we have max content samples
			if(max >= 3){
				if(exp === 0 || exp === 1) max_presented = 3;
				if(exp === 2 || exp === 3) max_presented = 2;
				if(exp === 4) max_presented = 1;
			} else {
				if(exp === 0 || exp === 1) max_presented = max;
				if(exp === 2 || exp === 3) max_presented = max - 1;
				if(exp === 4) max_presented = 1;
			}
		}
		//	Check repeat level and correct max presented
		if(rl < 100) max_presented--;
		if(rl > 100) max_presented++;
		//	Check final limits
		if(max_presented > max) max_presented = max;
		if(max_presented < 1) max_presented = 1;
		console.log('Max presented count for current activity: ' + max_presented + ' for activity - ' + this.card.activity);
		return max_presented;
	}

	increaseMaxPresented() {
		if(this.max_presented < this.max_repetitions) this.max_presented++;
		console.log('Max presented increased ('+this.card.activity+') !!!');
	}


}
