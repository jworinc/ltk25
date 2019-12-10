import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';

@Component({
  selector: 'app-wl1',
  templateUrl: './wl1.component.html',
  styleUrls: ['./wl1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Wl1Component extends BaseComponent implements OnInit {

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private wl1log: LoggingService, private wl1cs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, wl1log, wl1cs);
  }

  ngOnInit() {
    this.setHeader();
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
  	this.setCardNumber();
    this.card = this.data;
    console.log(this.data);
    this.current_header = this.card.header;
    this.display_result = {right: 0, wrong: 0};
    let that = this;
    //this.addNextWord();
    if(window.innerWidth <= 1024){
      this.row_height = 19;
      this.max_words = 8;
    }
  }

  public current_number: any;
  public card_id: any;
  public current_header: any;
  public words = [];
  public translations = [];
  public cw = 0;
  public pw = 0;
  public row_height = 35;
  public words_positions = [];
  public trans_positions = [];
  public is_mixed = false;
  public uinputph = 'present';
  public canvas: any;
  public ctx: any;
  public max_words = 10;
  public input_data: any = '';
  public expected_string = '';
  public display_result: any;
  public is_answered = false;
  public wc_started = false;

  initWordList() {
    
    

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
			if(!this.validate()) {
				
				//	Play card description
        if(!this.is_mixed) this.playCardDescription();
        else this.playContentDescription();
        this.disableMoveNext();
        //if(!this.wc_started){
        //  let that = this;
        //  setTimeout(()=>{
        //    that.addNextWord();
        //  }, 700);
        //}
			} else {
				this.enableMoveNext();
			}
			this.prevent_dubling_flag = true;
		}
		
	}

	hide() {
		this.prevent_dubling_flag = false;
		//	Hide option buttons
    this.optionHide();
    this.enterHide();
    this.playmedia.stop();
  }
  
  playContentDescription() {
    if(this.is_mixed){
      //this.playCurrentWord();
      let that = this;
      this.eslCustomInstructions('MatchInst', ()=>{
        setTimeout(()=>{ that.playCurrentWord(); }, 500);
      });
    } else {
    //if(!this.wc_started){
      let that = this;
      setTimeout(()=>{
        that.eslCustomInstructions('NextInst', ()=>{
          that.addNextWord();
        });
      }, 700);
    //} else this.eslCustomInstructions('NextInst');
    }
  }

	//	Create formated user input string for errors log
	getUserInputString() {
		return this.input_data;
	}

	//	Create formated expected string for errors log
	getExpectedString() {
		return this.expected_string;
	}



  addNextWord() {
    this.wc_started = true;
    if(!this.isActive()) return;
    if(this.cw > this.card.content.length-1 && this.cw > this.max_words-1){
      this.repeat();
      return;
    }
    let that = this;
    let color = "hsl(" + Math.ceil((Math.random() * 72) * 5) + ",60%,50%)";

    //  Check if we already have this word
    let we = false;
    this.words.map((w)=>{
      if(that.cw === w.key) we = true;
    });

    //  Add word to the list
    if(!we) {
      this.words.push({
        word: this.card.content[this.cw].title, 
        key: this.cw, 
        word_position: {top: (this.row_height * this.cw) + 'px'},
        hilight: false,
        color: color
      });
    }
    //  Play this word
    this.playmedia.word(this.card.content[this.cw].wavename, ()=>{
      //  After finish play word add translation if exists, else add 'no translation' caption
      let t = that.card.content[that.cw];
      
      if(t.translations.length > 0){
        let trans = t.translations[0];
        if(trans.length > 20) trans = t.translations[1];
        
        //  Check doublings
        let we = false;
        that.translations.map((t)=>{
          if(that.cw === t.key) we = true;
        });
        if(!we){
          that.translations.push({
            translation: trans, 
            key: that.cw, 
            trans_position: {top: (that.row_height * that.cw) + 'px'},
            color: color,
            origin_color: color,
            fade_color: '#aaa',
            trans_key: that.cw
          });
        }
      } else {
        that.translations.push({
          translation: 'no translation', 
          key: that.cw, 
          trans_position: {top: (that.row_height * that.cw) + 'px'},
          color: color,
          origin_color: color,
          fade_color: '#aaa',
          trans_key: that.cw
        });
      }
      //  Check if we still have words to show
      if(that.cw < that.card.content.length-1 && that.cw < that.max_words-1){
        //  Wait 1 seccond and add next word
        setTimeout(()=>{
          that.cw++;
          that.addNextWord();
        }, 1000);
      } else {
        //  Mix translations
        setTimeout(()=>{
          that.disableNextSlide();
          that.blinkOnlyNext();
        }, 1000);
      }
    }, 300);

  }

  mixTranslations() {
    this.translations = this.shuffle(this.translations);
    let that = this;
    setTimeout(()=>{
      for(let i in that.translations){
        let t = that.translations[i];
        let it = parseInt(i);
        t.trans_position = {top: (that.row_height * it) + 'px'};
        t.color = t.fade_color;
        t.trans_key = it;
      }
      that.is_mixed = true;
      setTimeout(()=>{ that.initDraw(); }, 10);
      //that.playCurrentWord();
    }, 200);
    this.words[0].hilight = true;
    
  }

  repeat() {
    //if(this.is_mixed){
    //  this.playCurrentWord();
    //} else {
    //  this.addNextWord();
    //}
    if(this.uinputph === 'finish'){
      let that = this;
      this.eslCustomInstructions('RespAtEnd', ()=>{
        that.moveNext();
      });
      return;
    }
    this.playContentDescription();
  }

  playCurrentWord() {
    this.playmedia.word(this.card.content[this.pw].wavename, ()=>{}, 100);
  }

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

  next() {
    if(this.uinputph === 'present'){
      this.uinputph = 'select';
      this.mixTranslations();
      this.enableNextSlide();
      let that = this;
      this.eslCustomInstructions('MatchInst', ()=>{
        setTimeout(()=>{ that.playCurrentWord(); }, 500);
      });
    }
  }

  playNextWord() {
    this.pw++;
    this.is_answered = false;
    if(this.pw < this.words.length){
      this.words[this.pw-1].hilight = false;
      this.words[this.pw].hilight = true;
      this.playmedia.word(this.card.content[this.pw].wavename, ()=>{}, 600);
    } else {
      this.words[this.pw-1].hilight = false;
      let that = this;
      setTimeout(()=>{
        that.elm.nativeElement.querySelectorAll('.words-list').forEach((e)=>{
          e.style.display = 'none';
        });
        that.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';
        that.enableNextCard();
        that.eslCustomInstructions('RespAtEnd', ()=>{
          that.moveNext();
        });
      }, 2000);
      this.uinputph = 'finish';
      
    }
  }

  //  Check user answer
  selectWord(w){
    if(this.uinputph === 'finish') return; 
    //  If word is right
    if(w.key === this.words[this.pw].key){

      //  Store results
      if(!this.is_answered){
        this.is_answered = true;
        this.display_result.right++;
        
      }


      w.color = w.origin_color;
      this.drawLink(this.words[this.pw], w);
      this.playmedia.action('CHIMES', function(){}, 100);
      this.playNextWord();
      
    } else {

      if(!this.is_answered){
        this.is_answered = true;
        this.display_result.wrong++;
        
      }

      //  Logging results
      this.card_object = 'Word';
      this.card_instance = this.words[this.pw].word;
      this.expected_string = this.translations[this.pw].translation;
      this.input_data = w.translation;
      this.result();

      this.playmedia.action('CHONG', function(){}, 100);
    }

  }

  initDraw() {
    this.canvas = this.elm.nativeElement.querySelector('canvas');
    if(this.canvas){
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.ctx = this.canvas.getContext("2d");
      
    }
  }

  drawLink(w, t) {
    let c = this.canvas;
    if(c){
      let ctx = this.ctx;
      //let h = c.clientHeight;
      let h = this.row_height * this.words.length;
      let x1 = 0;
      let x2 = c.clientWidth;
      let y1 = (w.key * (h/this.words.length)) + this.row_height/2+1;
      let y2 = (t.trans_key * (h/this.words.length)) + this.row_height/2+1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = w.color;
      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x2/2, y1, x2/2, y2, x2, y2);
      ctx.stroke();
    }
  }

  
	//	Enter click handler
	enter() {
		if(this.uinputph === 'finish'){
			this.enableNextCard();
		} 
	}


}
