import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-syp',
  templateUrl: './syp.component.html',
  styleUrls: ['./syp.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class SypComponent extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private syplog: LoggingService, private sypcs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, syplog, sypcs);
  }

  ngOnInit() {
  	this.card = this.data;
  	this.setHeader();
  	this.setCardNumber();
	//this.setCardId();

	//	Set current card header
	this.current_header = this.card.header;
	this.current_number = +this.data.cross_number;
	this.card_id = this.data.id;
	this.SYPComandProcessor();
  }


  	//	Set header for current card
	public current_header = '';

	public cmds = ['Cmd01', 'Cmd02', 'Cmd03', 'Cmd04', 'Cmd05', 'Cmd06', 'Cmd07', 'Cmd08', 'Cmd09', 'Cmd10', 'Cmd11', 'Cmd12', 'Cmd13', 'Cmd14', 'Cmd15', 'Cmd16', 'Cmd17', 'Cmd18', 'Cmd19', 'Cmd20', 'Cmd21', 'Cmd22', 'Cmd23', 'Cmd24', 'Cmd25'];

	//	Define current card number
	public current_number = 0;
	public card_id = 0;
	
	//	Add card data to directive scope
	public card: any;
	
	public current_comand = 0;
	
	public syp_card_played = false;

	public uinputph = 'play';

	public syp_card_picture = '';

	public syp_card_animation = [];

	public animation_delay = 500;

	public syp_card_word = '';

	public syp_card_inidesc = '';

	public inidesc_styling: any = {
		'opacity': '0',
		//'display': 'none !important'
	};

	public disable_enter_btn: boolean = false;

	//	Prevent performing of show function twice in some cases
	public prevent_dubling_flag = false;

	//	Callback for show card event
	show() {

		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){

			//	Stop play any media before show new card
			this.playmedia.stop();

			//	If user already finished this card
			if(this.validate()) {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
			this.current_comand = 0;
			if(!this.syp_card_played) this.SYPComandProcessor();
			else{
				let that = this;
				setTimeout(()=>{ that.setDescription(); }, 100);
			}
		}
		
	}

	hide() {
		if(this.uinputph !== 'finish' && this.prevent_dubling_flag){
			this.prevent_dubling_flag = false;
			this.resetCard();
			this.inidesc_styling = {
				'opacity': '1'
			}
		}
		//	Hide option buttons
		this.optionHide();
		this.prevent_dubling_flag = false;
	}

	//	Validate user answer
	validate(){
		if(this.uinputph === 'finish')
			return true;
		else return false;
	}


	handleNextDescStep() {
		this.disable_enter_btn = false;
		//	Check if it is first instruction with long read
		if(this.first_instruction_in_a_card){
			this.blinkEnter();
			this.uinputph = 'waitforuser';
			this.first_instruction_in_a_card = false;
			return;
		}

		//	Check if next buffer item is not syncroplay/waitforuser or option is not set, skip wait stuff
		let next = this.desc_buffer[0];
		if((typeof next !== 'undefined' && typeof next.type !== 'undefined' && next.type === 'syncroplay' && next.content === 'WaitForUser') ||
			!this.playmedia.pauseOnInstruction()
			){
			this.setDescription();
			return;
		}

		//	Now we sure that next item is not wait, also we have to ensure that next item is not last
		if(this.desc_buffer.length !== 0){
			this.blinkEnter();
			this.uinputph = 'waitforuser';
		} else {
			this.setDescription();
		}

	}


	//	Description buffer for audio sequence
	public desc_buffer = [];
	public current_description = 0;
	public first_instruction_in_a_card = true;
	public temp_inidesc = '';

	setDescription() {
		this.disable_enter_btn = true;
		//	Check if we played last audio instruction
		if(this.desc_buffer.length === 0){
			//	Allow move next
			this.uinputph = 'finish';
			this.enableNextCard();
		}

		let itm = this.desc_buffer.shift();

		let that = this;

		//	Regular expression that helps to filter names of start melodies from instruction list
		//let mr = /[a-z]/g;
		let mr = /^[A-Z]+$/;

		if(typeof itm !== 'undefined' && typeof itm.type !== 'undefined' && itm.type === 'desc'){
			
			if(!mr.test(itm.content) && itm.audio.split('')[0] === '_'){
				this.card.content[0].desc = itm.content;
				this.setGlobalDesc(itm.content);
			}
			
			this.current_description++;
			let c = itm;

			if(c.audio.split('')[0] === '_'){

				this.playmedia.sound(c.audio, function(){
					that.handleNextDescStep();
					
				}, 300);

			} else {
				this.playmedia.word(c.audio, function(){
					that.handleNextDescStep();
					
				}, 300);
			}
			
		} 
		else if(typeof itm !== 'undefined' && typeof itm.type !== 'undefined' && itm.type === 'picture'){
			
			this.syp_card_animation = [];
			this.syp_card_word = '';
			if(itm.content !== '/storage/app/public/pic_png/ltklogo1.png')
				this.syp_card_picture = itm.content;
			else this.syp_card_picture = '';
			console.log('Show picture - ' + itm.content);
			
			this.current_description++;
			setTimeout(function(){ that.setDescription(); }, 1);

		}
		else if(typeof itm !== 'undefined' && typeof itm.type !== 'undefined' && itm.type === 'animation'){

			this.syp_card_picture = '';
			this.syp_card_word = '';
			this.syp_card_animation.push(itm.content);
			console.log('Show picture - ' + itm.content);
			
			this.current_description++;
			setTimeout(function(){ that.setDescription(); }, this.animation_delay);

		}
		else if(typeof itm !== 'undefined' && typeof itm.type !== 'undefined' && (itm.type === 'letter' || itm.type === 'word')){
			console.log('Show letter - ' + itm.content);
			let c = itm;
			this.syp_card_picture = '';
			this.syp_card_animation = [];
			this.syp_card_word = itm.content;
			this.playmedia.word(itm.content, function(){
				that.setDescription();
				
			}, 600);
			
		}
		else if(typeof itm !== 'undefined' && typeof itm.type !== 'undefined' && itm.type === 'syncroplay'){
			this.disable_enter_btn = false;
			if(itm.content === 'WaitForUser'){
				let remaining_syp = true;
				for(let i in this.desc_buffer){
					if(this.desc_buffer[i].type !== 'syncroplay') remaining_syp = false;
				}
				if(!remaining_syp){
					this.blinkEnter();
					this.uinputph = 'waitforuser';
				} else {
					setTimeout(function(){ that.setDescription(); }, 2);
				}
				
			} 
			else if(itm.content === 'UnloadPicture'){
				
				setTimeout(function(){ that.setDescription(); }, 2);
			}
			else if(itm.content === 'UnloadText'){
				this.card.content[0].desc = '';
				this.setGlobalDesc('');
				setTimeout(function(){ that.setDescription(); }, 2);
			}
			else if(itm.content === 'Animation2'){
				this.animation_delay = 2000;
				
				setTimeout(function(){ that.setDescription(); }, 2);
			}
			else if(itm.content === 'Animation1'){
				this.animation_delay = 1000;
				
				setTimeout(function(){ that.setDescription(); }, 2);
			}
			else if(itm.content === 'Animation.5'){
				this.animation_delay = 500;
				
				setTimeout(function(){ that.setDescription(); }, 2);
			}
			else if(itm.content === 'Animation.3'){
				this.animation_delay = 300;
				
				setTimeout(function(){ that.setDescription(); }, 2);
			}
			else if(itm.content === 'Delay1'){
				setTimeout(function(){ that.setDescription(); }, 1000);
			}
			else if(itm.content === 'Delay2'){
				setTimeout(function(){ that.setDescription(); }, 2000);
			}
			else if(itm.content === 'Delay5'){
				setTimeout(function(){ that.setDescription(); }, 5000);
			}
			else {
				setTimeout(function(){ that.setDescription(); }, 2);
			}
		}

		
		//	Show init description
		this.inidesc_styling = {
			'opacity': '0',
			//'display': 'flex'
		}
		//	Show fade in animation for init description
		if(this.syp_card_word === '' && this.syp_card_picture === '' && this.syp_card_animation.length === 0 && typeof itm !== 'undefined' && (itm.type !== 'syncroplay' || (itm.type === 'syncroplay' && itm.content === 'WaitForUser')) )
			that.inidesc_styling = {'opacity': '1'};
		//	Skip pause after first instruction in case when content displayed, not init desc
		if((this.syp_card_word !== '' || this.syp_card_picture !== '' || this.syp_card_animation.length !== 0) && typeof itm !== 'undefined' && itm.type !== 'syncroplay') 
			this.first_instruction_in_a_card = false;

		//	Process exceptions for some lessons, there is no needed to pause on first instruction
		//	Lesson 28 position 12
		if(this.card.lesson === "lesson 028" && this.card.position === 12) this.first_instruction_in_a_card = false;

	}


	SYPComandProcessor() {

		if(this.syp_card_played) return;

		if(typeof this.card.content[0][this.cmds[this.current_comand]] !== 'undefined' && 
			typeof this.card.content[0][this.cmds[this.current_comand]].length !== 'undefined' &&
			this.card.content[0][this.cmds[this.current_comand]].length > 0){
			let command = this.card.content[0][this.cmds[this.current_comand]];

			//	Iterate each command and perform required action
			for(let i in command){
				let c = command[i];

				//	Check if we must set header
				if(typeof c.header !== 'undefined' && c.header !== ''){
					this.setGlobalHeader(c.header);
					
				}
				//	Check if we must set picture
				else if(typeof c.picture !== 'undefined' && c.picture !== ''){
					let syp_card_picture = this.playmedia.ltkmediaurl+'/storage/app/public/Pictures/'+c.picture+'.'+c.format;
					if(c.format.toLowerCase() === 'wmf') syp_card_picture = this.playmedia.ltkmediaurl+'/storage/app/public/pic_png/'+c.picture.toLowerCase()+'.png';
					this.desc_buffer.push({content: syp_card_picture, type: 'picture'});
				}
				//	Check if we must play animation
				else if(typeof c.animation !== 'undefined' && c.animation !== ''){
					let syp_card_picture = this.playmedia.ltkmediaurl+'/storage/app/public/Pictures/'+c.animation+'.'+(typeof c.format !== 'undefined' ? c.format : 'png');
					if((typeof c.format !== 'undefined' && c.format.toLowerCase() === 'wmf') || typeof c.format === 'undefined')
						syp_card_picture = this.playmedia.ltkmediaurl+'/storage/app/public/pic_png/'+c.animation.toLowerCase()+'.png';
					this.desc_buffer.push({content: syp_card_picture, type: 'animation'});
				}
				//	Check if we must handle syncroplay action
				else if(typeof c.syncroplay !== 'undefined' && c.syncroplay !== ''){
					this.desc_buffer.push({content: c.syncroplay, type: 'syncroplay'});
					if(c.syncroplay === 'Animation2'){
						this.animation_delay = 2000;
					}
					else if(c.syncroplay === 'Animation1'){
						this.animation_delay = 1000;
					}
					else if(c.syncroplay === 'Animation.5'){
						this.animation_delay = 500;
					}
					else if(c.syncroplay === 'Animation.3'){
						this.animation_delay = 300;
					}
				}
				//	Check if we must handle letter
				else if(typeof c.letter !== 'undefined' && c.letter !== ''){
					this.desc_buffer.push({content: c.letter, type: 'letter', wave: c.wave });
				}
				//	Check if we must handle word
				else if(typeof c.word !== 'undefined' && c.word !== ''){
					this.desc_buffer.push({content: c.word, type: 'word', wave: c.wave });
				}
				//	Check if we must play audio
				else if(typeof c.audio !== 'undefined' && c.audio !== ''){
					this.desc_buffer.push({content: c.pointer_to_value, type: 'desc', audio: c.audio});
					
					//	Prepare initial description for card
					let mr = /^[A-Z]+$/;
					//if(!mr.test(c.pointer_to_value) && c.audio.split('')[0] === '_' && c.pointer_to_value.length > 16) {
					//	if(this.temp_inidesc !== ''){
					//		this.syp_card_inidesc += '<p>' + this.temp_inidesc + '</p>';
					//		this.temp_inidesc = '';
					//	}
					//	this.syp_card_inidesc += '<p>' + c.pointer_to_value.replace('...', '') + '</p>';
					//}
					//else if(!mr.test(c.pointer_to_value) && c.audio.split('')[0] === '_' && c.pointer_to_value.length <= 16) {
					if(!mr.test(c.pointer_to_value) && c.audio.split('')[0] === '_') {
						//this.temp_inidesc += c.pointer_to_value.replace('...', '') + ' ';
						this.syp_card_inidesc += '<p>' + c.pointer_to_value.replace('...', '') + '</p>';
					}
					//	Check if last add it to description list
					//if(this.current_comand === this.cmds.length-1 && this.temp_inidesc !== '') 
					//	this.syp_card_inidesc += '<p>' + this.temp_inidesc + '</p>';

				} else {
					this.current_comand++;
					this.SYPComandProcessor();
					return;
				}

			}

			this.current_comand++;
			this.SYPComandProcessor();

		} else {
			this.current_comand++;
			if(this.current_comand >= this.cmds.length) {
				//if(this.isActive()) this.setDescription();
				this.syp_card_played = true;
				if(this.temp_inidesc !== ''){
					this.syp_card_inidesc += '<p>' + this.temp_inidesc + '</p>';
					this.temp_inidesc = '';
				}
				
				return;
			} else {
				this.SYPComandProcessor();
			}
		}

	}

	resetCard() {
		this.playmedia.stop();
		this.syp_card_played = false;
		this.current_comand = 0;
		//this.syp_card_picture = '/storage/app/public/pic_png/ltklogo1.png';
		this.syp_card_picture = '';
		this.syp_card_animation = [];
		this.syp_card_word = '';
		this.desc_buffer = [];
		this.current_description = 0;
		this.uinputph = 'play';
		this.syp_card_inidesc = '';
		this.first_instruction_in_a_card = true;
	}

	repeat() {
		//	Hide init description
		this.inidesc_styling = {
			'opacity': '0',
			//'display': 'none !important'
		}
		this.resetCard();
		this.SYPComandProcessor();
		if(this.isActive()) this.setDescription();
	}

	hint(){};

	enter() {
		if(this.disable_enter_btn && this.uinputph !== 'finish') return;
		if(this.uinputph === 'finish' && this.getUserInputString() !== ''){
			let that = this;
			this.playCorrectSound(function(){ 
				that.enableNextCard();
			});
		}
		if(this.uinputph === 'finish' && this.getUserInputString() === ''){
			this.enableNextCard();
		}
		else if(this.uinputph === 'waitforuser') {
			this.setDescription();
		}
	}






}