import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { LoggingService } from '../../services/logging.service';
import { PickElementService } from '../../services/pick-element.service';

@Component({
  selector: 'app-wl1',
  templateUrl: './wl1.component.html',
  styleUrls: ['./wl1.component.scss'],
  host: { 'class': 'book-wrapper-slide' }
})
export class Wl1Component extends BaseComponent implements OnInit {

  isShowRemainigWords: boolean;
  isShowNextWordBtn: boolean;
  resultCount = 0;
  isAllRemainWordsShown: boolean;

  public current_number: any;
  public card_id: any;
  public current_header: any;
  public words = [];
  public _words = [];

  public translations = [];
  public cw = 0;
  public pw = 0;
  public row_height = 70;
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
  _cw = 0;
  public isAllWordMatched: boolean = false;
  private isNextClicked: boolean = false;

  constructor(private elm: ElementRef, 
              private sanitizer: DomSanitizer, 
              private playmedia: PlaymediaService, 
              private wl1cs: ColorschemeService,
              private wl1log: LoggingService,
              private wl1pe: PickElementService) {
    super(elm, sanitizer, playmedia, wl1log, wl1cs, wl1pe);
  }

  ngOnInit() {
    this.isAllWordMatched = false;
    this.setHeader();
    this.current_number = +this.data.cross_number;
    this.card_id = this.data.id;
    this.setCardNumber();
    this.card = this.data;
    this.current_header = this.card.header;
    this.display_result = { right: 0, wrong: 0 };
    let that = this;
    //this.addNextWord();
    if (window.innerWidth <= 1024) {
      this.row_height = 30;
      this.max_words = 10;
    }
  }


  initWordList() {



  }

  ngAfterViewInit() {
    this.elm.nativeElement.querySelector('.words-columns').style.height = '82%';

  }


  //	Validation of user input
  validate() {
    if (this.uinputph === 'finish')
      return true;
    else return false;
  }

  //	Callback for show card event
  show() {
    //	If card is active and it is not dubling
    if (this.isActive() && !this.prevent_dubling_flag) {
      //	If user not enter valid data yet
      if (!this.validate()) {

        //	Play card description
        if (!this.is_mixed) this.playCardDescription();
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
    if (this.is_mixed) {
      //this.playCurrentWord();
      let that = this;
      this.eslCustomInstructions('MatchInst', () => {
        setTimeout(() => { that.playCurrentWord(); }, 500);
      });
    } else {
      //if(!this.wc_started){
      let that = this;
      setTimeout(() => {
        if (!that.isShowRemainigWords && this.words.length > 0) { return; }
        that.eslCustomInstructions('NextInst', () => {
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
    if (!this.isActive()) return;

    if (this.isNextClicked) { return };

    if (this.cw > this.card.content.length - 1 && this.cw > this.max_words - 1) {
      this.repeat();
      return;
    }
    this.disableNextSlide();
    this.isNextClicked = true;

    let that = this;
    let color = "hsl(" + Math.ceil((Math.random() * 72) * 5) + ",60%,50%)";

    //  Check if we already have this word
    let we = false;
    this.words.map((w) => {
      if (that.cw === w.key) we = true;
    });

    //  Add word to the list
    if (!we) {
      if (this.isShowRemainigWords && this.words.length === 0) {
        this.row_height = 0;
        this._cw = 0;
      }
      if (this.isShowRemainigWords && this.words.length > 0) {
        if (window.innerWidth <= 1024) {
          this.row_height = 30;
          this.max_words = 10;
        } else {
          this.row_height = 70;

        }
      }
      if (!this.isShowRemainigWords) {
        this._cw = this.cw;
      }
      this.words.push({
        word: this.card.content[this.cw].title,
        key: this._cw,
        word_position: { top: (this.row_height * this._cw) + 'px' },
        hilight: false,
        color: color
      });

    }
    let cw = this.cw;
    setTimeout(() => {
      this.isNextClicked = false;
    }, 1000);
    //  Play this word
    this.playmedia.word(this.card.content[this.cw].wavename, () => {
      //  After finish play word add translation if exists, else add 'no translation' caption
      let t = that.card.content[that.cw];

      if (t.translations.length > 0) {
        let trans = t.translations[0];
        if (trans.length > 20) trans = t.translations[1];

        //  Check doublings
        let we = false;
        that.translations.map((t) => {
          if (that.cw === t.key) we = true;
        });
        if (that.isShowRemainigWords) {
          cw = that._cw;
        }
        if (!we) {
          that.translations.push({
            translation: trans,
            key: cw,
            trans_position: { top: (that.row_height * cw) + 'px' },
            color: color,
            origin_color: color,
            fade_color: '#aaa',
            trans_key: cw
          });
        }
      } else {
        that.translations.push({
          translation: 'no translation',
          key: cw,
          trans_position: { top: (that.row_height * cw) + 'px' },
          color: color,
          origin_color: color,
          fade_color: '#aaa',
          trans_key: cw
        });
      }
      //  Check if we still have words to show
      that.isNextClicked = false;

      if (that.cw < that.card.content.length - 1 && that.cw < that.max_words - 1) {
        //  Wait 1 seccond and add next word
        setTimeout(() => {
          that.cw++;
          if (that.isShowRemainigWords) {
            that._cw++;
          }
          that.blinkOnlyNext();

          // that.addNextWord();
        }, 200);
      } else {
        //  Mix translations
        setTimeout(() => {
          that.cw++;
          that.disableNextSlide();
          that.blinkOnlyNext();
        }, 200);
      }
    }, 300);

  }



  mixTranslations() {
    this.translations = this.shuffle(this.translations);
    let that = this;
    setTimeout(() => {
      for (let i in that.translations) {
        let t = that.translations[i];
        let it = parseInt(i);
        t.trans_position = { top: (that.row_height * it) + 'px' };
        t.color = t.fade_color;
        t.trans_key = it;
      }
      that.is_mixed = true;
      setTimeout(() => { that.initDraw(); }, 10);
      //that.playCurrentWord();
    }, 200);
    this.words[0].hilight = true;

  }

  repeat() {
    if (this.uinputph === 'finish') {
      let that = this;
      this.eslCustomInstructions('RespAtEnd', () => {
        that.moveNext();
      });
      return;
    }
    this.playContentDescription();

  }
  playSelected(w) {
    //	If mouse event locked by feedback
		if(this.wl1pe.mouseLock()) return;
    this.playmedia.stop();
    this.playmedia.word(w, () => { }, 100);

  }

  playCurrentWord() {
    this.playmedia.word(this.card.content[this.pw].wavename, () => { }, 100);
  }

  //	Shuffles array in place.
  //	@param {Array} a items An array containing the items.
  shuffle(a) {
    let j, x, i;
    let out = [];
    for (let k in a)
      out.push(a[k]);
    for (i = out.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = out[i];
      out[i] = out[j];
      out[j] = x;
    }
    return out;
  }

  showRemainWords() {
    //	If mouse event locked by feedback
		if(this.wl1pe.mouseLock()) return;
    this.isShowRemainigWords = true;
    this.words = [];
    this.translations = [];
    this.is_mixed = false;
    this.isShowNextWordBtn = false;
    this.pw = 0;
    this.display_result = { right: 0, wrong: 0 };
    this.elm.nativeElement.querySelectorAll('.words-list').forEach((e) => {
      e.style.display = 'block';
    });
    this.elm.nativeElement.querySelector('.words-columns').style.height = '82%';
    this.elm.nativeElement.querySelector('.gsc-results').style.display = 'none';

    this.addNextWord();
  }

  next() {
    this.playmedia.stop();
    if (this.cw === this.card.content.length && this.isShowRemainigWords) {
      if (this.uinputph === 'present') {
        this.uinputph = 'select';

        if (this.is_mixed) {
          this.eslCustomInstructions('MatchInst', () => {
            setTimeout(() => { that.playSelected(this.words[0].word) }, 500);
          });
          return;
        }

        this.mixTranslations();
        // this.enableNextSlide();
        let that = this;
        this.eslCustomInstructions('MatchInst', () => {
          setTimeout(() => { that.playSelected(this.words[0].word) }, 500);
        });
        // this.uinputph = 'select';
        // this.mixTranslations();
        // let that = this;
        // this.playmedia.sound('_SMTWTTCM', () => {
        //   that.playSelected(this.words[0].word);
        // }, 100);
        this.isShowRemainigWords = false;
        this.isAllRemainWordsShown = true;
      }
    }
    if (this.words.length === 5 && !this.isShowRemainigWords) {
      if (this.is_mixed) {
        let that = this;

        this.eslCustomInstructions('MatchInst', () => {
          setTimeout(() => { that.playSelected(this.words[0].word) }, 500);
        });
        return;
      }
      this.mixTranslations();
      let that = this;
      this.eslCustomInstructions('MatchInst', () => {
        setTimeout(() => { that.playSelected(this.words[0].word) }, 500);
      });
      this.playContentDescription();
      return;
    }
    if (this.words.length < 5 && !this.isShowRemainigWords && this.cw < this.card.content.length - 1) {
      if (this.is_mixed) {
        let that = this;
        this.eslCustomInstructions('MatchInst', () => {
          setTimeout(() => { that.playSelected(this.words[0].word) }, 500);
        });
        return;
      }
      setTimeout(() => {
        this.addNextWord();

      }, 1000);
    }
    if (this.isShowRemainigWords && this.cw < this.card.content.length) {
      if (this.is_mixed) {
        let that = this;
        this.eslCustomInstructions('MatchInst', () => {
          setTimeout(() => { that.playSelected(this.words[0].word) }, 500);
        });
        return;
      }
      setTimeout(() => {
        this.addNextWord();

      }, 1000);
    }

  }

  playNextWord() {
    this.pw++;
    this.is_answered = false;
    if (this.cw === this.card.content.length) {
      this.isAllWordMatched = true;
    }
    if (this.pw < this.words.length) {
      this.words[this.pw - 1].hilight = false;
      this.words[this.pw].hilight = true;
      if (this.isAllRemainWordsShown) {
        this.playmedia.word(this.words[this.pw].word, () => { }, 600);
      }
      if (!this.isAllRemainWordsShown) {
        this.playmedia.word(this.card.content[this.pw].wavename, () => { }, 600);
      }
    } else {
      this.words[this.pw - 1].hilight = false;
      let that = this;
      setTimeout(() => {
        that.elm.nativeElement.querySelectorAll('.words-list').forEach((e) => {
          e.style.display = 'none';
        });
        that.elm.nativeElement.querySelector('.words-columns').style.height = '49%';
        that.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';

        that.isShowNextWordBtn = true;
        that.enableNextCard();
        that.eslCustomInstructions('RespAtEnd', () => {
          // that.moveNext();
        });

        // if (this._cw === this.words.length-1 && this.isShowRemainigWords) {
        //   this.isShowNextWordBtn = false;
        // }
      }, 2000);
      if (this.cw === this.max_words - 1) {
        this.uinputph = 'finish';
        this.isShowRemainigWords = false;

      }

    }
  }

  //  Check user answer
  selectWord(w) {
    //	If mouse event locked by feedback
		if(this.wl1pe.mouseLock()) return;
    if (this.uinputph === 'finish') return;
    //  If word is right
    if (w.key === this.words[this.pw].key) {

      //  Store results
      if (!this.is_answered) {
        this.is_answered = true;
        this.display_result.right++;

      }


      w.color = w.origin_color;
      this.drawLink(this.words[this.pw], w);
      this.playmedia.action('CHIMES', function () { }, 100);
      this.playNextWord();



    } else {

      if (!this.is_answered) {
        this.is_answered = true;
        this.display_result.wrong++;

      }

      //  Logging results
      this.card_object = 'Word';
      this.card_instance = this.words[this.pw].word;
      this.expected_string = this.translations[this.pw].translation;
      this.input_data = w.translation;
      this.result();

      this.playmedia.action('CHONG', function () { }, 100);
    }

  }

  initDraw() {
    this.canvas = this.elm.nativeElement.querySelector('canvas');
    if (this.canvas) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.ctx = this.canvas.getContext("2d");

    }
  }

  drawLink(w, t) {
    let c = this.canvas;
    if (c) {
      let ctx = this.ctx;
      //let h = c.clientHeight;
      let h = this.row_height * this.words.length;
      let x1 = 0;
      let x2 = c.clientWidth;
      let y1 = 1;
      let y2 = 1;
      if (window.innerWidth <= 1024) {
        y1 = ((w.key * (h / this.words.length)) + this.row_height / 2 + 1);
        y2 = ((t.trans_key * (h / this.words.length)) + this.row_height / 2 + 1);
      } else {
        y1 = ((w.key * (h / this.words.length)) + this.row_height / 2 + 1) - 20;
        y2 = ((t.trans_key * (h / this.words.length)) + this.row_height / 2 + 1) - 20;
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = w.color;
      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x2 / 2, y1, x2 / 2, y2, x2, y2);
      ctx.stroke();
    }
  }


  //	Enter click handler
  enter() {
    if (this.uinputph === 'finish') {
      this.enableNextCard();
    }
  }


}
