import { Component, OnInit, Input, ElementRef, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';
import { PlaywordsDirective } from '../../directives/playwords.directive';

@Component({
  selector: 'app-bs1',
  templateUrl: './bs1.component.html',
  styleUrls: ['./bs1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Bs1Component extends BaseComponent implements OnInit {


	@ViewChildren(PlaysentenceDirective) psns;
	@ViewChildren(PlaywordsDirective) pwds;

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
		public uinputph = 'sentence';
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

			}
			
		}

		
		playContentDescription() {
    
				let that = this;
				this.eslCustomInstructions('NextInst', ()=>{
					setTimeout(()=>{ 
						if(!that.senstarted) that.startSentence(that.sentence_index);
						else that.nextSentence(that.sentence_index);
					}, 500);
				});
			
		}


		//	Card hide hook
		hide() {
			this.prevent_dubling_flag = false;
			if(this.uinputph !== 'finish') this.uinputph = 'enablenext';
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
						that.uinputph = 'enablenext';
					}
				}
				that.showFirstPartOfSentence();
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
					s.style = {'top': (this.row_height*(this.sentence_index - id) + 5) + 'px', 'opacity': '1'};
				}
			}
			//this.s_pull[this.sentence_index]
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
