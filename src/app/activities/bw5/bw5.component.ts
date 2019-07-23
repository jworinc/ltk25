import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BasebwComponent } from '../basebw/basebw.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { Observable } from 'rxjs';
import { flatMap } from "rxjs/operators";
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { OptionService } from '../../services/option.service';

@Component({
  selector: 'app-bw5',
  templateUrl: './bw5.component.html',
  styleUrls: ['./bw5.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bw5Component extends BasebwComponent implements OnInit, DoCheck {
  
	constructor(private element:ElementRef, 
							private sz: DomSanitizer, 
							private pms: PlaymediaService, 
							private bw5log: LoggingService, 
							private bw5cs: ColorschemeService,
							private op: OptionService) {
  	super(element, sz, pms, bw5log, bw5cs);
  }

  public expected_digraf: any;

  ngOnInit() {

  	//	Set header for current card
	this.setHeader();
	this.current_number = +this.data.cross_number;
	this.card_id = this.data.id;
	this.setCardNumber();
	//this.setCardId();
	this.card = this.data;
	this.current_header = this.card.header;
	//this.max_presented = this.card.content.length;

	//	Define number of repetitions
	this.max_repetitions = this.card.content.length;
	let op = this.op.getOptions();
	this.max_presented = this.getMaxPresented(this.max_repetitions, op);

	this.setCard();

	//	User answer phases, letters, sounds and vowel sound, rec, listen, compare, finish
	this.uinputph = 'letters';

	let that = this;
	
	//	Stop recording listner
	this.recstop_event.subscribe(() => {
		if(that.isActive() && typeof that.uinputph !== 'undefined' && that.uinputph === 'rec'){
			that.uinputph = 'listen';
			setTimeout(function(){ that.playContentDescription(); }, 500);
		}
	});

	//	Start playing listner
	this.playstop_event.subscribe(() => {
		if(that.isActive() && typeof that.uinputph !== 'undefined' && that.uinputph === 'listen'){
			that.uinputph = 'compare';
			setTimeout(function(){ that.playContentDescription(); }, 500);
		}
	});

	this.old_input_data = JSON.stringify(this.input_data);

  }


  	setCard() {

		this.input_data = '';
		this.answer_word = '';
		let content = '';
		this.element.nativeElement.querySelector('.bw1-word-wrap').style.opacity = '0';
		this.uinputph = 'letters';
		this.main_description_part_played = false;

		let ci = this.current_card_instance;
		
		//	Expected result digraf
		this.expected_digraf = '';

		//	The regular expressions for different conditions (digraph, long vowel sound, long vowel team, three letter blend)
		let dgr = null;
		if(typeof this.card.content[0].SkillBase !== 'undefined' && this.card.content[0].SkillBase.length > 0){
			let sb = this.card.content[0].SkillBase[0].pointer_to_value;
			if(sb === 'dg'){
				dgr = /ang|ank|ch|ck|h|ing|ink|ong|onk|ph|sh|tch|th|ung|unk|wh/ig;
			}
			else if(sb === 'lvs'){
				dgr = /ild|ind|old|olt|ost/ig;
			}
			else if(sb === 'lvt'){
				dgr = /ai|ay|ea|ee|ie|oa|oe|old|ow/ig;
			}
			else if(sb === 'sl'){
				dgr = /gh|gn|kn|mb|rh|wr/ig;
			}
			else if(sb === 'tlb'){
				dgr = /scr|shr|spl|spr|squ|str|thr/ig;
			}
		} else {
			dgr = /ing|ank|ang|ch|ck|ing|ink|ong|onk|old|ild|ind|olt|ost|ph|sh|tch|th|ung|unk|wh|mb|gn|rh|gh|kn|ai|ay|ea|ee|ie|oa|oe|ow|scr|shr|spl|spr|squ|str|thr/ig;
		}
		

		for(let i in this.card.content[ci].parts){

			let cn = this.card.content[ci].parts[i] = this.card.content[ci].parts[i].replace(/\-/ig, '');
			
			if(cn.match(dgr) !== null) this.expected_digraf = cn;

			this.answer_word += cn;

		}
		
		//	Check if expected digraph is empty, maybe it splited in several parts. Needed to check whole word
		if(this.expected_digraf === "") {
			let m = this.answer_word.match(dgr);
			if(m !== null && m.length > 0){
				this.expected_digraf = m[0];
			}
		}

		//	Expected num of letters
		this.expected = this.answer_word.replace(/\'/ig, '').length;
	}

	//	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
			//	If user not enter valid data yet
			if(!this.validate()) {
				
				//	Play card description
				this.playCardDescription();
				//this.playContentDescription();
				this.disableMoveNext();
				
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.input_data = '';
		}
		
	}

	//	Overload default play description function
	playCardDescription() {

		if(this.main_description_part_played){
			this.playContentDescription();
			return;
		}

		//	Instruction index, represents each instruction step
		let iindex = 0;

		let that = this;
		//	Play the first instruction insequence
		const pr1 = Observable.create((observer) => {
		  
			let i = that.card.content[0].instructions[iindex];
			that.card.content[0].desc = i.pointer_to_value;
			that.setGlobalDesc(i.pointer_to_value);
			//	Check if first instruction is 'Now watch this.', otherwice there are only two instructions
			//	and we must skip first and switch to next step
			if(i.pointer_to_value !== 'Now watch this.') { 
				setTimeout(function(){ 
					observer.next(0); observer.complete();
				}, 1);
			};

    		if(typeof i.audio !== 'undefined' && i.audio !== ''){
    			that.pms.sound(i.audio, function(){
    				observer.next(0); observer.complete();
    			});
    		}
    		that.main_description_part_played = true;
    		iindex++;
		    
		})
		//	Play second instruction with required word
		.pipe(flatMap((result) => {
		  return Observable.create((observer) => {

		  	that.element.nativeElement.querySelector('.bw1-word-wrap').style.opacity = '1';
				let i = that.card.content[0].instructions[iindex];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
					if(typeof i.audio !== 'undefined' && i.audio !== ''){
						setTimeout(function(){
							that.pms.sound(i.audio, function(){});
							that.pms.word(that.answer_word, function(){
								observer.next(0); observer.complete();
							});
						}, 1000);
					}
					iindex++;
					that.main_description_part_played = true;

				});
		}));

		//	Play third part instruction with required word
		pr1.subscribe((finalResult) => {
			if(that.card.content[0].instructions.length > iindex){
				let i = that.card.content[0].instructions[iindex];
				that.card.content[0].desc = i.pointer_to_value;
				that.setGlobalDesc(i.pointer_to_value);
				if(typeof i.audio !== 'undefined' && i.audio !== ''){
					setTimeout(function(){
						that.pms.sound(i.audio, function(){});
						that.pms.word(that.answer_word, function(){
							setTimeout(function(){ that.playContentDescription(); }, 1000);
							
						});
					}, 1000);
				}
				iindex++;
			} else setTimeout(function(){ that.playContentDescription(); }, 1000);
		  


		});





	}

	repeat() {
		this.playContentDescription();
	}

	//	Phase incorrect message
	respIfIncorrect() {
		//[1].content["0"]["RespIf Incorrect1"]
		let digits = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
		let that = this;
		if(this.uinputph === 'letters'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect1"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(this.card.content["0"]["RespIfIncorrect1"][0].audio, function(){
				that.clearUserInput(); that.setFocus();
			});
			
		}
		else if(this.uinputph === 'sounds'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect2"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			this.pms.sound(this.card.content["0"]["RespIfIncorrect2"][0].audio, function(){
				that.clearUserInput(); that.setFocus();
			});
		}
		else if(this.uinputph === 'digraf'){
			this.card.content[0].desc = this.card.content["0"]["RespIfIncorrect3"][0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].desc);
			let resp_key = "";
			this.pms.sound(this.card.content["0"]["RespIfIncorrect3"][0].audio, function(){
				if(resp_key === "") return;
				that.card.content[0].desc = that.card.content["0"][resp_key][0].pointer_to_value;
				that.setGlobalDesc(that.card.content[0].desc);
			});
			if(typeof this.card.content[this.current_card_instance].skill !== 'undefined'){
				let skill = this.card.content[this.current_card_instance].skill;
				if(typeof this.card.content[0].SkillA !== 'undefined' && this.card.content[0].SkillA.length > 0 && skill === this.card.content[0].SkillA[0].pointer_to_value){
					resp_key = "RespIfIncorrect3A";
				}
				else if(typeof this.card.content[0].SkillB !== 'undefined' && this.card.content[0].SkillB.length > 0 && skill === this.card.content[0].SkillB[0].pointer_to_value){
					resp_key = "RespIfIncorrect3B";
				}
				else if(typeof this.card.content[0].SkillC !== 'undefined' && this.card.content[0].SkillC.length > 0 && skill === this.card.content[0].SkillC[0].pointer_to_value){
					resp_key = "RespIfIncorrect3C";
				}
				else if(typeof this.card.content[0].SkillD !== 'undefined' && this.card.content[0].SkillD.length > 0 && skill === this.card.content[0].SkillD[0].pointer_to_value){
					resp_key = "RespIfIncorrect3D";
				}
				else if(typeof this.card.content[0].SkillE !== 'undefined' && this.card.content[0].SkillE.length > 0 && skill === this.card.content[0].SkillE[0].pointer_to_value){
					resp_key = "RespIfIncorrect3E";
				}
				this.pms.sound(this.card.content["0"][resp_key][0].audio, function(){ that.clearUserInput(); that.setFocus(); });
				
				let desc_pull = [];

				//	Play rest of instructions, if required play the word
				for(let i = 1; i < this.card.content["0"][resp_key].length; i++){
					desc_pull.push(this.card.content["0"][resp_key][i].pointer_to_value);
					this.pms.sound(this.card.content[0][resp_key][i].audio, function(){ that.card.content[0].desc = desc_pull.shift(); that.setGlobalDesc(that.card.content[0].desc); }, 400);
					if(this.card.content["0"][resp_key][i].pointer_to_value === "The word is..."){
						this.pms.word(this.answer_word, function(){ that.card.content[0].desc = desc_pull.shift(); that.setGlobalDesc(that.card.content[0].desc);  }, 400);
					}
				}
				
			}
			
		}
	}

	//	Enter click handler
	//	Overload of default function, the target is to catch moment when user enter the digraph
	//	angular watcher creates a problem in this case, so this action must be approved by user with click enter button
	enter() {
		let that = this;
		
		if(this.uinputph === 'digraf' && this.input_data !== ''){
			if(this.input_data.toLowerCase() === this.expected_digraf.toLowerCase()){
				this.uinputph = 'rec';
				this.playContentDescription();
				
			} else {

				//	Log user error
				this.card_object = 'Question';
				this.card_instance = this.expected_string = 'Enter the letters for the digraph in the word. ' + this.answer_word + ' ('+this.expected+')';
				this.result();

				this.respIfIncorrect();
				
			}
			return;
		}
		else if((this.uinputph === 'digraf' || this.uinputph === 'letters' || this.uinputph === 'sounds') && this.input_data === ''){
			this.repeat();
			return;
		}
		
		this.pms.stop();
		if(!this.validate()){
			this.pms.sound('_STNQR', function(){ 
				that.enableNextCard(); that.clearUserInput(); that.play_card_description_busy = false; that.playCardDescription();
			});
		} else {
			that.playCorrectSound(function(){ 
				that.enableNextCard();
			});
		}
	}

	public play_pronouce_busy_flag: boolean = false;
	playPronounce(cb = ()=>{}){

		if(this.play_pronouce_busy_flag) return;
		this.play_pronouce_busy_flag = true;

		let callback = cb;
		let that = this;
		//	Play pronuncuation of the word
		if(typeof this.card.content[this.current_card_instance].pronounce !== 'undefined' && this.card.content[this.current_card_instance].pronounce.length > 0){

			//	Delay before play each sound
			let del = 400;
			let ml = 0;
			for(let i in this.card.content[this.current_card_instance].pronounce) {
				let p = '_S' + this.card.content[this.current_card_instance].pronounce[i]; p = p.replace('-', '');
				this.element.nativeElement.querySelectorAll('.bw1-letter').forEach((e)=>{
					e.style.backgroundColor = '#C69C6C';
				});
				this.element.nativeElement.querySelector('.bw1-letter[data-index="'+ml+'"]').style.backgroundColor = '#00ADEF';
				//	Check if we play the last sound, switch user input phase to next and play next instructions
				if(parseInt(i) === this.card.content[this.current_card_instance].pronounce.length - 1){
					this.pms.sound(p, function(){
						
						if(typeof callback !== 'undefined') setTimeout(function(){ 
							callback(); 
						}, del*2);
						that.play_pronouce_busy_flag = false;
						that.element.nativeElement.querySelectorAll('.bw1-letter').forEach((e)=>{
							e.style.backgroundColor = '#C69C6C';
						});
					}, del);
				} else {
					this.pms.sound(p, function(){
						ml++;
						that.element.nativeElement.querySelectorAll('.bw1-letter').forEach((e)=>{
							e.style.backgroundColor = '#C69C6C';
						});
						that.element.nativeElement.querySelector('.bw1-letter[data-index="'+ml+'"]').style.backgroundColor = '#00ADEF';
					}, del);
				}
			}
		}
	}

	//	Used to play task word and sound exactly after instructions play finished
	playContentDescription() {
		let that = this;
		//	Phase 1 how many letters
		if(typeof this.card.content[0].Question1 !== 'undefined' && this.card.content[0].Question1.length > 0 && this.uinputph === 'letters'){
			this.lastUncomplete = this.card.content[0].Question1[0];
			this.card.content[0].desc = this.card.content[0].Question1[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Question1[0].pointer_to_value);
			this.pms.sound(this.card.content[0].Question1[0].audio, function(){
				that.setFocus();
				that.input_data = '';
			});
		} 
		//	Phase 2 how many sounds
		else if(typeof this.card.content[0].Question2 !== 'undefined' && this.card.content[0].Question2.length > 0 && this.uinputph === 'sounds'){
			this.lastUncomplete = this.card.content[0].Question2[0];
			this.card.content[0].desc = this.card.content[0].Question2[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Question2[0].pointer_to_value);
			this.pms.sound(this.card.content[0].Question2[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
		}
		//	Phase 3 vowel sound
		else if(typeof this.card.content[0].Question3 !== 'undefined' && this.card.content[0].Question3.length > 0 && this.uinputph === 'digraf'){
			this.lastUncomplete = this.card.content[0].Question3[0];
			this.card.content[0].desc = this.card.content[0].Question3[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].Question3[0].pointer_to_value);
			this.pms.sound(this.card.content[0].Question3[0].audio, function(){
				that.setFocus();
				that.input_data = '';
				
			});
			this.pms.word(this.answer_word, function(){});
		}
		//	Phase 4 rec instructions, if mic is enabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && this.global_recorder){
			this.lastUncomplete = this.card.content[0].RecInst[0];
			this.card.content[0].desc = this.card.content[0].RecInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].RecInst[0].pointer_to_value);
			this.blinkRec();
			this.pms.sound(this.card.content[0].RecInst[0].audio, function(){
				that.card.content[0].desc = that.card.content[0].RecInst[1].pointer_to_value;
				that.setGlobalDesc(that.card.content[0].RecInst[1].pointer_to_value);
				that.pms.sound(that.card.content[0].RecInst[1].audio, function(){});
				that.pms.word(that.answer_word, function(){});
			});
		}
		//	Phase 4 rec instructions, if mic is disabled
		else if(typeof this.card.content[0].RecInst !== 'undefined' && this.card.content[0].RecInst.length > 0 && this.uinputph === 'rec' && !this.global_recorder){
			this.finishOrContinueBW();
		}
		//	Phase 5 listen instructions
		else if(typeof this.card.content[0].PlayInst !== 'undefined' && this.card.content[0].PlayInst.length > 0 && this.uinputph === 'listen'){
			this.lastUncomplete = this.card.content[0].PlayInst[0];
			this.card.content[0].desc = this.card.content[0].PlayInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].PlayInst[0].pointer_to_value);
			this.blinkPlay();
			this.pms.sound(this.card.content[0].PlayInst[0].audio, function(){});
		}
		//	Phase 6 compare instructions
		else if(typeof this.card.content[0].NextInst !== 'undefined' && this.card.content[0].NextInst.length > 0 && this.uinputph === 'compare'){
			this.lastUncomplete = this.card.content[0].NextInst[0];
			this.card.content[0].desc = this.card.content[0].NextInst[0].pointer_to_value;
			this.setGlobalDesc(this.card.content[0].NextInst[0].pointer_to_value);
			this.blinkWord();
			this.pms.sound(this.card.content[0].NextInst[0].audio, function(){});
		}
	}



	//	Watch if user type any data
	ngDoCheck() {
	    //const change = this.differ.diff(this.input_data);
	    if(this.isActive() && JSON.stringify(this.input_data) !== this.old_input_data){

	    	this.old_input_data = JSON.stringify(this.input_data);

	    	let that = this;

			//	When current phase is letters, check if num letters match with user input and switch to next
			if(this.uinputph === 'letters' && this.input_data !== ''){
				if(this.input_data == this.expected){
					this.askNumSounds();
				} else {
					//	Log user error
					this.card_object = 'Question';
					this.card_instance = this.expected_string = 'How Many Letters? ' + this.answer_word + ' ('+this.expected+')';
					this.result();

					this.respIfIncorrect();
				}
			}
			//	Check if user input correct num of sounds
			if(this.uinputph === 'sounds' && this.input_data !== ''){
				if(+this.input_data === this.expected){
					this.uinputph = 'digraf';
					this.expected = this.expected_digraf;
					
					this.playCardDescription();
					return;
				} else {
					//	Log user error
					this.card_object = 'Question';
					this.card_instance = this.expected_string = 'How Many Sounds? ' + this.answer_word + ' ('+this.expected+')';
					this.result();
					
					this.respIfIncorrect();
				}
			}
			
			//	Validate user input and decide enable or not next card
			if(that.validate()){
				that.enableMoveNext();

			}
			else that.disableMoveNext();

	    }
	    
	}


}