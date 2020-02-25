import { Component, OnInit, Input, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { LoggingService } from '../../services/logging.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { PlaysentenceDirective } from '../../directives/playsentence.directive';

@Component({
  selector: 'app-rw1',
  templateUrl: './rw1.component.html',
  styleUrls: ['./rw1.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class Rw1Component extends BaseComponent implements OnInit {

  @ViewChildren(PlaysentenceDirective) psn !: QueryList<PlaysentenceDirective>;

  constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private rw1log: LoggingService, private rw1cs: ColorschemeService) {
  	super(elm, sanitizer, playmedia, rw1log, rw1cs);
  }

  ngOnInit() {
  	this.setHeader();
  	this.current_number = +this.data.cross_number;
  	this.card_id = this.data.id;
  	this.setCardNumber();
    this.card = this.data;
    this.showTranslation = false;
    this.eventStatus = false;
    console.log(this.data);
    this.current_header = this.card.header;
    this.sentence_index = Math.floor(Math.random() * 100000);
    let that = this;
    setTimeout(()=>{ 
      that.updateWordblocks(); 
      that.updateViewStates();
      that.elm.nativeElement.querySelectorAll('.word-block').forEach((e)=>{
        e.style.opacity = '1';
      });
    }, 10);
    this.wblength = this.card.content.length;
    this.initViewStates();

    //  Mark words in sample sentences with the bold font
    for(let i in this.card.content){
      let c = this.card.content[i];
      if(typeof c.content[0].sentence !== 'undefined'){
        let wr = c.title;
        let wr1 = wr.substring(wr.length-2, wr.length) === 'es' ? wr.substring(0, wr.length - 2) : wr.substring(wr.length-1, wr.length) === 's' ? wr.substring(0, wr.length-1) : '';
        let wg = new RegExp('\\b'+wr+'\\b', 'i');
        let wg1 = new RegExp('\\b'+wr1+'\\b', 'i');
        if(wg.test(c.content[0].sentence))
          c.content[0].sentence = c.content[0].sentence.replace(wg, '<b>'+wr+'</b>');
        else if(wg1.test(c.content[0].sentence))
          c.content[0].sentence = c.content[0].sentence.replace(wg1, '<b>'+wr1+'</b>');
      }
    }

    
    //	Prev button press event
    this.prev_btn.subscribe(()=>{
      if(that.isActive()) that.showPrevWord();
    });

    this.compilePlaySentences();

  }
  
  public current_number: any;
  public card_id: any;
  public current_header: any;
  public wblength: number = 0;
  public showTranslation:any;
  public eventStatus:any;
  public uinputph = 'review';
  public sentence_index = 0;
  //  Current word
  public cw: number = 0;

  //  Word blocks view states, (word | pronounce | sentence)
  public wbvs = [];

  //	Callback for show card event
	show() {
		//	If card is active and it is not dubling
		if(this.isActive() && !this.prevent_dubling_flag){
		
      //	Play card description
      this.playCardDescription();
        
      this.prevent_dubling_flag = true;
      this.showPrev();
      this.disableNextSlide();
      this.cw = 0;
      this.uinputph = 'review';
      this.resetViewStates();
      this.updateWordblocks();
      this.updateViewStates();
      //  Init new interactivity sentence
      this.initISS();
		}
		
  }
  
  playContentDescription() {
    
      let that = this;
      this.eslCustomInstructions('NextInst', ()=>{
        setTimeout(()=>{ 
          that.playWord(that.card.content[that.cw].wavename);
          that.blinkOnlyNext();
        }, 500);
      });
    
  }

  repeat() {
    if(this.uinputph === 'finish'){
      let that = this;
      this.eslCustomInstructions('RespAtEnd', ()=>{
        that.moveNext();
      });
      return;
    }
    this.playContentDescription();
  }

  //  Init Word blocks view states
  initViewStates() {
    for(let i = 0; i < this.wblength; i++){
      this.wbvs.push({view: 'word'});
    }
  }

  //  Reset Word blocks view states
  resetViewStates() {
    for(let i = 0; i < this.wblength; i++){
      if(typeof this.wbvs[i].view !== 'undefined') this.wbvs[i].view = 'word';
    }
  }

  //  Update word blocks view states
  updateViewStates() {
    let that = this;
    //  Go over all wordblocks elements and calc vertical view position
    this.elm.nativeElement.querySelectorAll('.word-block').forEach(element => {
      //  Get width of word block
      let h = element.clientWidth + 25;
      //  Get position in word blocks list
      let p = +element.attributes.wordindex.value;
      //  Get current view
      let v = that.wbvs[p].view;
      //  Define phisical position on card in pixels
      if(v === 'word'){
        //  Define word view
        element.querySelector('.word-box').style.left='0';
        element.querySelector('.phoneme-box').style.left=h+'px';
        element.querySelector('.sentence-box').style.left=h+'px';
        element.querySelector('.word-box').style.opacity='1';
        element.querySelector('.phoneme-box').style.opacity='0';
        element.querySelector('.sentence-box').style.opacity='0';
      }
      else if(v === 'pronounce'){
        //  Define pronounce view
        element.querySelector('.word-box').style.left=((-1)*h)+'px';
        element.querySelector('.phoneme-box').style.left='0';
        element.querySelector('.sentence-box').style.left=h+'px';
        element.querySelector('.word-box').style.opacity='0';
        element.querySelector('.phoneme-box').style.opacity='1';
        element.querySelector('.sentence-box').style.opacity='0';
      } else {
        //  Define sample sentence
        element.querySelector('.word-box').style.left=((-1)*h)+'px';
        element.querySelector('.phoneme-box').style.left=((-1)*h)+'px';
        element.querySelector('.sentence-box').style.left='0';
        element.querySelector('.word-box').style.opacity='0';
        element.querySelector('.phoneme-box').style.opacity='0';
        element.querySelector('.sentence-box').style.opacity='1';
      }
    });

  }

  showTranslationStatus(e)
  {
    if(this.showTranslation)
      this.showTranslation = false;
    else
      this.showTranslation = true;
  }
  
  //  Update word blocks position according to current word
  updateWordblocks(){
    
    let that = this;

    //  Go over all wordblocks elements and calc position
    this.elm.nativeElement.querySelectorAll('.word-block').forEach(element => {
      //  Get width of word block
      let w = element.clientWidth*2;
      //  Get position in word blocks list
      let p = +element.attributes.wordindex.value;
      //  Define phisical position on card in pixels
      if(p === that.cw){
        //  Define current word block position
        element.style.left = '0px';
      }
      else if(p > that.cw){
        //  Define before current word blocks position
        element.style.left = w+'px';
      } else {
        //  Define after current word blocks position
        element.style.left = ((-1)*w)+'px';
      }
    });

  }

  //  When rw card is not finished, and user try to go next, lesson will show warn complete message
  //  in this case next slide is enabled and behaviour of next arrow button changed to default, not switch word
  //  so user is unable to finish card because it impossible. To prevent this issue, when user close warn complete
  //  disable next slide and change next arrow button to review words state
  onCloseWarnComplete() {
    if(this.isActive()){
      let cw = this.cw;
      if(this.wbvs[cw].view === 'sentence' && cw >= this.wbvs.length) this.enableNextSlide();
      else this.disableNextSlide();
    }
  }

  next() {
    if(this.isActive()){
      let cw = this.cw;
      if(this.wbvs[cw].view === 'sentence' && cw > this.wbvs.length) this.enableNextSlide();
      else this.disableNextSlide();
      this.showNextWord();
    }

    //this.compilePlaySentences();

  }

  //  Click event handler, go to the next word block
  showNextWord() {

    //  Stop play audios
    this.playmedia.stop();

    //  Check current word view state
    let vs = this.wbvs[this.cw];

    //  When reach sentence view, we can move to the next wordblock
    if(vs.view === 'sentence'){
      //  Max word blocks
      let m = this.wblength;
      this.cw++;

      //  Check overhead
      if(this.cw >= m) {
        this.cw = m-1;
        //  Finish card
        this.uinputph = 'finish';
        this.enableNextCard();
      } else {

      }
      
      //  Update word blocks
      this.updateWordblocks();
      this.repeat();
    }
    //  Else switch to the next view
    else {

      this.showNextView();
      
      //  Init new interactivity sentence
      this.updateISS();

    }

    
  }

  //  Click event handler, go to the prev word block
  showPrevWord() {

    //  Stop play audios
    this.playmedia.stop();

    //  Check current word view state
    let vs = this.wbvs[this.cw];

    //  When reach word view, we can move to the prev wordblock
    if(vs.view === 'word'){
      this.cw--;
      //  Check overhead
      if(this.cw < 0) {
        this.cw = 0;
        //this.enableNextSlide();
        this.movePrev();
        return;
      }
      //  Update word blocks
      this.updateWordblocks();
      this.repeat();
    }
    //  Else switch to the prev view
    else {
      this.showPrevView();
      //  Init new interactivity sentence
      this.updateISS(true);
    }
    this.uinputph = 'review';
    this.disableNextSlide();
  }

  //  Click event handler, down view
  showNextView() {
    let cw = this.cw;
    //  Check current view state and switch down
    if(this.wbvs[cw].view === 'word') this.wbvs[cw].view = 'pronounce';
    else if(this.wbvs[cw].view === 'pronounce') this.wbvs[cw].view = 'sentence';
    this.updateViewStates();
  }

  //  Click event handler, up view
  showPrevView(){
    let cw = this.cw;
    //  Check current view state and switch up
    if(this.wbvs[cw].view === 'sentence') this.wbvs[cw].view = 'pronounce';
    else if(this.wbvs[cw].view === 'pronounce') this.wbvs[cw].view = 'word';
    this.updateViewStates();
  }

  //  Play word
  playWord(name) {
    this.playmedia.stop();
    this.playmedia.word(name, ()=>{});
  }

  public pronounce_play_sequence_started: boolean = false;
  public pronounce_play_counter: number = 0;
  public mask_syl_pos = [];

  playPronounce(id) {
    this.playmedia.stop();
    this.elm.nativeElement.querySelectorAll('.phoneme-syllable span').forEach((e)=>{
      e.style.backgroundColor = 'transparent';
    });
    this.mask_syl_pos = [];
    let c = this.card.content[this.cw];
    if(c.pronounce !== ""){
      this.pronounce_play_counter = 0;
      let cp = c.pronounce.split("-");
      let that = this;
      //	Create audio objects for each syllable
      for(let i in cp){
        let phs = cp[i];
        let ph = phs.split(",");
        for(let k in ph){
          let sl = ph[k];
          if(sl === '') continue;
          sl = '_S'+sl.toUpperCase();
          this.playmedia.sound(sl, ()=>{
            that.pronounce_play_counter++;
            if(that.pronounce_play_counter > that.mask_syl_pos.length) that.pronounce_play_counter = that.mask_syl_pos.length;
            if(that.pronounce_play_counter > that.mask_syl_pos.length-1){
              that.elm.nativeElement.querySelectorAll('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span').forEach((e)=>{
                e.style.backgroundColor = 'transparent';
              });
            } else {
              let s = that.mask_syl_pos[that.pronounce_play_counter];
              that.elm.nativeElement.querySelectorAll('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span').forEach((e)=>{
                e.style.backgroundColor = 'transparent';
              });
              that.elm.nativeElement.querySelector('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span[playsyl=\''+s.syl+'\'][playpos=\''+s.pos+'\']')
                .style.backgroundColor = 'yellow';
            }
            
          }, 300);
          this.mask_syl_pos.push({syl: i, pos: k});
        }
      }
      let ss = that.mask_syl_pos[that.pronounce_play_counter];
      that.elm.nativeElement.querySelectorAll('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span').forEach((e)=>{
        e.style.backgroundColor = 'transparent';
      });
      that.elm.nativeElement.querySelector('.phoneme-box[wordblock="'+id+'"] .phoneme-syllable span[playsyl=\''+ss.syl+'\'][playpos=\''+ss.pos+'\']')
        .style.backgroundColor = 'yellow';
      
    }
  } 

  checkForName(word) {

    let res = /[A-Z]+/.test(word.substr(0, 1));
    //console.log('Check for name ('+word+'): '+res);
    return res;

  }

  playDefaultSampleSentence() {
    let ssw = this.elm.nativeElement.querySelectorAll('.ss-default span');
    let firstp = [];
    let secondp = [];
    let def_timer = null;
    //if(ssw.length > 0) firstp = ssw[0];
    //if(ssw.length > 1) secondp = ssw[1];
    for(let i in ssw){
      if(parseInt(i)%2 === 0) firstp.push(ssw[i]);
      else secondp.push(ssw[i]);
    }
    firstp.map((e)=>{ if(typeof e !== 'undefined' && typeof e.classList !== 'undefined') e.classList.add('playsentence-hilight'); });
    let that = this;
    this.eslCustomInstructions('NextInst', ()=>{
      clearTimeout(def_timer);
      firstp.map((e)=>{ if(typeof e !== 'undefined' && typeof e.classList !== 'undefined') e.classList.remove('playsentence-hilight'); });
      secondp.map((e)=>{ if(typeof e !== 'undefined' && typeof e.classList !== 'undefined') e.classList.add('playsentence-hilight'); });
      def_timer = setTimeout(()=>{
        secondp.map((e)=>{ if(typeof e !== 'undefined' && typeof e.classList !== 'undefined') e.classList.remove('playsentence-hilight'); });
      }, 2000);
      setTimeout(()=>{ 
        that.playWord(that.card.content[that.cw].wavename);
      }, 500);
    });

    def_timer = setTimeout(()=>{
      firstp.map((e)=>{ if(typeof e !== 'undefined' && typeof e.classList !== 'undefined') e.classList.remove('playsentence-hilight'); });
      secondp.map((e)=>{ if(typeof e !== 'undefined' && typeof e.classList !== 'undefined') e.classList.remove('playsentence-hilight'); });
    }, 2000);


  }

  compilePlaySentences() {
    let that = this;
		//	After setting card story we have to wait before angular process playwords directive
		setTimeout(()=>{
			that.psn.forEach((d)=>{
        d.compileSentence();
      });
			//
		}, 20);


  }


  //  Max number of showing sentences
  public issmax = 3;
  //  Current iss index in current word instance
  public issindex = 0;
  //  Interactiv Sample Sentence to show
  public iss_display = '';
  //  Variants of words for display
  public iss_variants = [];
  //  Current word
  public iss_word = '';
  //  Origin sentence
  public iss_origin_sentence = '';
  //  Buffer for sentence groups (for each word)
  public iss_buffer = [];

  public current_sentences = [];
  public current_sentence = "";

  //  Sample Sentence interaction
  initISS() {

    //  Current sentence subset
    let current_sentences = [];
    this.current_sentence = "";
    this.iss_buffer = [];

    for(let n in this.card.content){
      current_sentences = [];
      //  Check if we have several sentences
      if(typeof this.card.content[n].sentences !== 'undefined' &&
      this.card.content[n].sentences.length > 0){
        for(let i in this.card.content[n].sentences)
          current_sentences.push({sentence: this.card.content[n].sentences[i].sentence, word: this.card.content[n].title, pos: n });
      } 
      else if(typeof this.card.content[n].sentence !== 'undefined'){
        current_sentences.push({sentence: this.card.content[n].sentence, word: this.card.content[n].title, pos: n });
      }

      let iss_item = this.processISS(current_sentences);

      //  Save instance to buffer
      this.iss_buffer.push(iss_item);

    }

  }

  processISS(current_sentences) {

    let out = [];

    for(let i in current_sentences) {
      let cs = current_sentences[i].sentence;
      let cw = current_sentences[i].word;
      let pos = current_sentences[i].pos;
      
      //  Check if sentence contains current word
      let r = new RegExp('\\b'+cw+'\\b', 'i');
      if(cs.search(r) >= 0) {

        //  Replace for display sentence required word with dots
        let iss_display = cs.replace(r, '<span class="gwf-answer-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;&nbsp;&nbsp;&nbsp;</span>');
        //  Clear variants
        let iss_variants = [];
        //  Get variants
        iss_variants.push(cw);
        while(iss_variants.length < this.issmax) {
          //  Get random index
          let ri = Math.round(Math.random() * (this.card.content.length-1));
          //  Check if index is not current word index
          if(ri === pos) continue;
          //  Push the word to variants
          if(iss_variants.indexOf(this.card.content[ri].title) < 0 && this.card.content[ri].title !== "") 
            iss_variants.push(this.card.content[ri].title);
        }

        //  Save processed data
        out.push({iss_display: iss_display, iss_variants: iss_variants, pos: pos, answered: false, origin_sentence: cs, word: cw});
  
      } else {

        out.push({iss_display: cs, iss_variants: [cw], pos: pos, answered: true, origin_sentence: cs, word: cw});

      }



    }

    return out;

    
  }

  updateISS(backward = false) {

    //  Get iss instance for current word (for now work with only first sentence)
    let issi = null;
    if(!backward) issi = this.iss_buffer[this.cw][0];
    else if(backward && this.cw > 0) issi = this.iss_buffer[this.cw-1][0];
    else issi = this.iss_buffer[this.cw][0];

    //  Reset answer flag if not answered
    if(!issi.answered) this.user_answer_received_flag = false;
    
    //  Display sentence
    this.iss_display = issi.iss_display;
    //  Display variants
    this.iss_variants = issi.iss_variants;
    //  Expected word
    this.iss_word = issi.word;
    //  Origin sentence
    this.iss_origin_sentence = issi.origin_sentence;

    this.compileInteractiveSS(issi.iss_display);

  }

  compileInteractiveSS(origin_sentence = '') {
    //  Update sentences translation and play feature
    let that = this;
    setTimeout(()=>{
      //console.log(that.psn);
      that.psn.forEach(function(s){ 
        if((<any>s).elmt.nativeElement.classList.contains('interactive-ss') && that.isActive()) {
          if(origin_sentence !== '') (<any>s).origin_text = origin_sentence;
          (<any>s).compileSentence();
        }
      });
    }, 200);
  }

  saveISSAnswerResult() {
    
    //  Get iss instance for current word (for now work with only first sentence)
    let issi = this.iss_buffer[this.cw][0];
    //  Display sentence
    issi.iss_display = issi.origin_sentence;
    //  Display variants
    issi.iss_variants = [this.iss_word];
    issi.answered = true;

  }

  public user_answer_received_flag: boolean = false;
	addAnswer(w) {
		let that = this;
		if(this.user_answer_received_flag) return;
		this.user_answer_received_flag = true;

		//	Check if answer right or not
		if(w.toLowerCase() === this.iss_word.toLowerCase()){
			this.playmedia.action('DING', function(){
        that.iss_variants = [that.iss_word];
        that.blinkOnlyNext();
      });
			this.elm.nativeElement.querySelector('span[data-wrdsspos="'+this.cw+'"] .gwf-answer-placeholder').innerText = w;
			//setTimeout(function(){ 
				//that.psn.origin_text = that.card.content[0].parts[that.current_set].title.replace(/\(/ig, '').replace(/\)/ig, ''); 
				//that.psn.compileSentence(); 
				//setTimeout(()=>{ that.playSentence(); }, 10);
			//}, 1400);
		} else {
			//	Logging wrong answer
			//this.result();
			//	Play wrong sound and show right answer
			this.playmedia.action('CHONG', function(){
				//that.blinkAP(true);
				//that.elm.nativeElement.querySelector('.gwf-answer-placeholder').style.width = 'auto';
        that.elm.nativeElement.querySelector('span[data-wrdsspos="'+that.cw+'"] .gwf-answer-placeholder').innerText = that.iss_word;
        that.iss_variants = [that.iss_word];
        that.blinkOnlyNext();
				//setTimeout(function(){
				//	that.psn.origin_text = that.card.content[0].parts[that.current_set].title.replace(/\(/ig, '').replace(/\)/ig, '');
				//	that.psn.compileSentence();
				//	setTimeout(()=>{ that.playSentence(); }, 10);
					
				//}, 1400);
			});
			

		}

    this.compileInteractiveSS(this.iss_origin_sentence);
    
	}



}