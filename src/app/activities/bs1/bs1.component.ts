import { Component, OnInit, Input, ElementRef, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';
import { PlaywordsDirective } from '../../directives/playwords.directive';
import { FontadjusterDirective } from '../../directives/fontadjuster.directive';

@Component({
  selector: 'app-bs1',
  templateUrl: './bs1.component.html',
  styleUrls: ['./bs1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bs1Component extends BaseComponent implements OnInit {


	@ViewChildren(PlaysentenceDirective) psns;
	@ViewChildren(PlaywordsDirective) pwds;
	@ViewChildren(FontadjusterDirective) fads;

  	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private bs1log: LoggingService, private gmucs: ColorschemeService) {
  	  	super(elm, sanitizer, playmedia, bs1log, gmucs);
    }

  

		public current_sentence = "";
		public current_variant = "";
		public sentence_index = 0;
		public previous_index = 0;
		public main_ind = 0 ;
		public show_sentences = [];
		public len = 0;

		public cn:any;
		public show_variants;
		public header = "";
		public subtitle = "";
		public uinputph = 'introductory';
		public senstarted = false;
		
		public show_sentence_begin = false;
		public show_sentence_var = false;
		public show_begin_timer: any = null;
		public show_var_timer: any = null;
		public enter_timer: any = null;
		public i_sentence_begin = 1;
		public i_sentence_var = 2;
		public s_pull = [];
		public ss: any;
		public ww: any;
		public row_height = 57;
		public currentinnerWidth = 0;
		public header_compiled = false;
		public intro_inst = [];

    	ngOnInit() {
			console.log(this.data);
			this.card = this.data;
			this.header = this.data.content[0].header;
			this.subtitle = this.data.content[0].subtitle;
			this.cn = this.data.content;
			if(window.innerWidth <= 1024){
				this.row_height = 19;

			}
			this.currentinnerWidth = window.innerWidth;

			//	Get introductory frame instructions
			if(typeof this.card.content[0].Instructions !== 'undefined' && this.card.content[0].Instructions.length > 0) {
				for(let i in this.card.content[0].Instructions) {
					let ins = this.card.content[0].Instructions[i];
					if(typeof ins.english_subtitle !== 'undefined' && ins.english_subtitle !== "")
						this.intro_inst.push(ins.english_subtitle);
					else this.intro_inst.push(ins.pointer_to_value);
				}
			}
			if(typeof this.card.content[0].NextInst !== 'undefined' && this.card.content[0].NextInst.length > 0) {
				for(let i in this.card.content[0].NextInst) {
					let ins = this.card.content[0].NextInst[i];
					if(typeof ins.english_subtitle !== 'undefined' && ins.english_subtitle !== "")
						this.intro_inst.push(ins.english_subtitle);
					else this.intro_inst.push(ins.pointer_to_value);
				}
			}

		}
		
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
				if(!this.validate()) {
					
					//	Play card description
					this.playCardDescription();
					this.disableMoveNext();
					let that = this;
					setTimeout(()=>{
						//if(!that.senstarted) that.startSentence(that.sentence_index);
						//else that.nextSentence(that.sentence_index);
					}, 700);
				} else {
					this.enableMoveNext();
				}
				this.prevent_dubling_flag = true;
				let that = this;
				if(!this.header_compiled){
					setTimeout(()=>{
						that.ww = that.pwds.toArray();
						for(let i in that.ww){
							that.ww[i].initText();
						}
						that.header_compiled = true;
					}, 10);
				}

				this.setGlobalHeader(this.header);

			}
			
		}

		
		playContentDescription() {
    
				let that = this;
				this.eslCustomInstructions('NextInst', ()=>{
					/*
					setTimeout(()=>{ 
						that.uinputph = 'sentence';
						if(!that.senstarted) that.startSentence(that.sentence_index);
						else that.nextSentence(that.sentence_index);
					}, 500);
					*/
					if(that.uinputph === 'introductory'){
						that.disableNextSlide();
						that.blinkOnlyNext();
					} else {
						setTimeout(()=>{ 
							that.uinputph = 'sentence';
							if(!that.senstarted) that.startSentence(that.sentence_index);
							else that.nextSentence(that.sentence_index);
						}, 500);
					}
					
				});
			
		}

		next() {
			if(this.uinputph !== 'introductory') {
				this.repeat();
				return;
			}
			let that = this;
			that.uinputph = 'sentence';
			that.enableNextSlide();
			if(this.cn.length - 1 >= this.sentence_index){
				if(typeof this.ss !== 'undefined'){
					this.ss.map((s)=>{ 
						s.stop(); 
					});
				}
			}
			if(!that.senstarted) that.startSentence(that.sentence_index);
			else that.nextSentence(that.sentence_index);
		}


		//	Card hide hook
		hide() {
			this.prevent_dubling_flag = false;
			if(this.uinputph !== 'finish') this.uinputph = 'introductory';
			//	Hide option buttons
			this.optionHide();
			this.enterHide();
		}

		repeat() {
			if(this.cn.length - 1 >= this.sentence_index){
				if(typeof this.ss !== 'undefined'){
					this.ss.map((s)=>{ 
						s.stop(); 
					});
				}
				//this.nextSentence(this.sentence_index);
				//this.blinkEnter();
				this.playContentDescription();
			} else {
				this.enableNextCard();
			}
		}

		//	Update font size
		updateFonts() {
			this.fads.forEach((fa)=>{
				if(typeof fa.update !== 'undefined') fa.update();
			});
		}

		startSentence(i) {
			let that = this;
			this.senstarted = true;
			//	Add sentence to layout
			this.current_sentence = this.cn[0].intro;
			this.current_variant = this.cn[0].var;

			//	Add all sentences to a single pull
			for(let i in this.cn){
				let c = this.cn[i].var;
				let b = this.cn[i].intro;
				this.s_pull.push({
					sen: b + ' ' + c, 
					ind: parseInt(i)+3, 
					style: {'top': '-60px', 'opacity': '0'},
					beg: b,
					var: c
				});
				
			}

			//	Compile sentence after short delay, that will needed for angular to build a markup
			setTimeout(()=>{
				that.ss = that.psns.toArray();
				for(let i in that.ss){
					that.ss[i].origin_text = '';
					that.ss[i].compileSentence();
					that.ss[i].end_callback = ()=>{
						if(that.uinputph !== 'finish') that.uinputph = 'enablenext';
					}
				}
				that.showFirstPartOfSentence();
				that.updateFonts();
			}, 10);
			this.uinputph = 'ressentence';
		}

		nextSentence(i) {
			let that = this;
			//	Add sentence to layout
			this.current_sentence = this.cn[i].intro;
			this.current_variant = this.cn[i].var;
			setTimeout(()=>{
				if(that.previous_index !== i){
					that.previous_index = i;
					that.ss[0].origin_text = '';
					that.ss[1].origin_text = '';
					that.ss[0].compileSentence();
					that.ss[1].compileSentence();
				}
				that.showFirstPartOfSentence();
				that.updateFonts();
			}, 20);
			this.uinputph = 'ressentence';
		}

		showFirstPartOfSentence() {
			let that = this;
			this.show_sentence_begin = true;
			if(this.ss.length > 0){
				this.show_begin_timer = setTimeout(()=>{
					if(that.isActive()){
						that.ss[0].playSentenceByIndex(1, ()=>{
							that.showSecondPartOfSentence();
						});
					}
				}, 1000);
			}
		}

		showSecondPartOfSentence() {
			let that = this;
			this.show_sentence_var = true;
			if(this.ss.length > 0){
				this.show_var_timer = setTimeout(()=>{
					if(that.isActive()){
						that.ss[1].playSentenceByIndex(2, ()=>{
							that.showEnter();
							setTimeout(()=>{
								that.blinkEnter();
								that.uinputph = 'enablenext';
								that.eslCustomInstructions('ResultInst', ()=>{
									
								});
							}, 1000);
						});
					}
				}, 1000);
				
			}
		}

		recalcSentPositions() {
			let max = this.s_pull.length;
			for(let i in this.s_pull){
				let s = this.s_pull[i];
				let id = parseInt(i);
				if(id <= this.sentence_index){
					//s.style = {'top': (this.row_height*(this.sentence_index - id) + 5) + 'px', 'opacity': '1'};
					s.style = {'opacity': '1', 'display': 'flex'};
				}
			}
			//this.s_pull[this.sentence_index]
			
			//	Scroll down sentences to the last
			let that = this;
			setTimeout(()=>{
				let se = that.elm.nativeElement.querySelector('.sen-ready-list');
				se.scrollTop = se.clientHeight * 2;
				that.updateFonts();
			}, 100);
			
		}

		enter() {
			if(this.uinputph !== 'enablenext' && this.uinputph !== 'finish') return;
			let that = this;
			this.show_sentence_begin = false;
			this.show_sentence_var = false;
			this.ss.map((s)=>{ 
				s.stop(); 
			});
			clearTimeout(this.show_begin_timer);
			clearTimeout(this.show_var_timer);
			clearTimeout(this.enter_timer);
			this.recalcSentPositions();
			if(this.cn.length - 1 > this.sentence_index){
				//this.show_sentences.push(this.current_sentence + ' ' + this.current_variant);
				this.sentence_index++;
				this.uinputph = 'ressentence';
				let that = this;
				this.enter_timer = setTimeout(()=>{ if(that.isActive()) that.nextSentence(that.sentence_index); }, 1500);
			} else {
				this.uinputph = 'finish';
				//this.playCorrectSound(function(){});
				this.eslCustomInstructions('RespAtEnd', ()=>{
					that.moveNext();			
				});
				this.enableNextCard();
			}
		}

}
