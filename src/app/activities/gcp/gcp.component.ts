import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
//import { CompileShallowModuleMetadata } from '@angular/compiler';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gcp',
  templateUrl: './gcp.component.html',
  styleUrls: ['./gcp.component.scss'],
  host: {'class': 'book-wrapper-slide'}
})
export class GcpComponent extends BaseComponent implements OnInit {

  	constructor(private elm:ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gcplog: LoggingService, private gcpcs: ColorschemeService) {
  	  	super(elm, sanitizer, playmedia, gcplog, gcpcs);
    }

  	ngOnInit() {
      console.log(this.data);
      this.setHeader();
      this.display_result = {right: 0, wrong: 0};
      this.current_number = +this.data.cross_number;
      this.card_id = this.data.id;
      this.setCardNumber();
      //this.setCardId();

      this.card = this.data;
      this.card_object = 'Sentence';
      this.current_header = this.card.header;
      this.initCroswordInstances();
    }

    public display_result: any;
    //	Set header for current card
    public current_header = '';
    
    //	User answer phases, rec, listen, compare, split to syllables, finish
    public uinputph = 'rec';

    public input_data = '';
    //	Define current card number
    public current_number = 0;
    public card_id = 0;
    public prevent_dubling_flag = false;
    
    public current_set = 0;
    public expected_string: any;
    public current_word: any;
    public answer_received = false;
    public cr_layout = [];
    public cr_questions = [];
    public cr_questionstodisplay = [];
    public words = [];
    public mask = [];
    public revmask = [];
    public showmask = [];
    public hlmask = [];
    public cr_w = null;
    public question_ready: boolean = false;

    initCroswordInstances() {
      let c = this.card.content[0].parts[0];
      this.cr_layout = c.crossword.split('\n');
      this.cr_questions = c.question.split('\n');
      for(let i in this.cr_questions){
        let q = this.cr_questions[i];
        let wr = q.match(/\([a-zA-Z]*\)/ig);
        if(wr && wr.length > 0) this.words.push(wr[0].replace('(', '').replace(')', ''));
        this.cr_questionstodisplay.push(q.replace(/\([a-zA-Z]*\)/ig, '______'));
      }
      this.words = this.shuffle(this.words);
      this.generateMask();
    }

    
    //	Callback for show card event
    show() {
      //	If card is active and it is not dubling
      if (this.isActive() && !this.prevent_dubling_flag) {
        //	If user not enter valid data yet
        if (!this.validate()) {

          //	Play card description
          this.playCardDescription();
          this.disableMoveNext();

        } else {
          this.enableMoveNext();
        }
        this.prevent_dubling_flag = true;
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

    repeat(){
      let that = this;
      if(this.uinputph !== 'finish'){
        if(typeof this.card.content[0].LoopInst !== 'undefined' && this.card.content[0].LoopInst.length > 0 && this.current_set < this.cr_questionstodisplay.length && this.current_set >= 0){
          this.card.content[0].desc = this.card.content[0].LoopInst[0].pointer_to_value;
          this.setGlobalDesc(this.card.content[0].desc);
          this.playmedia.sound(this.card.content[0].LoopInst[0].audio, function(){
            if(that.current_set > 0 && that.question_ready){
              let s = that.cr_questionstodisplay[that.current_set - 1];
              that.card.content[0].desc = s;
              that.setGlobalDesc(s);
            } else {
              that.showNextSentence();
            }
          });
        }
      } else {
        this.enter();
      }
    }

    //	Used to play task word and sound exactly after instructions play finished
    playContentDescription() {
      let that = this;
      if(typeof this.card.content[0].LoopInst !== 'undefined' && this.card.content[0].LoopInst.length > 0 && this.current_set < this.cr_questionstodisplay.length){
        this.card.content[0].desc = this.card.content[0].LoopInst[0].pointer_to_value;
        this.setGlobalDesc(this.card.content[0].desc);
        this.playmedia.sound(this.card.content[0].LoopInst[0].audio, function(){
          that.showNextSentence();
        });
      } else {
        that.showNextSentence();
      }
    }

    generateMask() {
      this.mask = [];
      this.revmask = [];
      this.showmask = [];
      this.hlmask = [];
      //  Most biggest length string
      let mbs = '';

      for(let i in this.cr_layout){
        let l = this.cr_layout[i];
        let ll = l.split('');
        for(let d in ll) if(ll[d].trim() == '') ll[d] = ' ';
        this.mask.push(ll);
        
        //  Get most biggest length string
        if(l.length > mbs.length) mbs = l;
      }

      //  Need to fill all mask to mbs length
      for(let i in this.mask){
        let mm = this.mask[i];
        if(mm.length < mbs.length){
          for(let sp = mm.length; sp < mbs.length; sp++){
            mm.push(' ');
          }
        }
        //  Fill showmask with hide values (false)
        let m = [];
        let h = [];
        for(let f in mm) m.push(false); h.push(false);
        this.showmask.push(m);
        this.hlmask.push(h);
      }

      //  Reverse mask x/y
      for(let i = 0; i < mbs.length; i++){
        let r = [];
        for(let k in this.mask){
          let m = this.mask[k];
          if(m.length > i) r.push(m[i]);
        }
        this.revmask.push(r);
      }

      //  correct layout width according to length for desktop
      this.cr_w = {'width': (mbs.length * 25)+'px'};

      //  correction for mobile
      if(window.innerWidth <= 1024){
        this.cr_w = {'width': (mbs.length * 15)+'px'};
      }

      console.log('Crossword Mask ready');
      console.log(this.mask);
      console.log('Crossword Reverse Mask ready');
      console.log(this.revmask);
      console.log('Crossword Show Mask ready');
      console.log(this.showmask);
    }

    clearHL() {
      
      //  Last part is clear highlight of selected word
      let that = this;
      setTimeout(()=>{
        for(let i in that.hlmask){
          for(let k in that.hlmask[i]) that.hlmask[i][k] = false;
        }
      }, 1000);
      

    }

    showWord(w, only_hiligh = false) {

      //  First check mask array for current word
      for(let m in this.mask){
        let wss = this.mask[m].join('').split(' ');
        //  Issue with indexOf method, from split() it sometimes returns -1 on existing element, problem is extra characters, need trim
        let ff = false;
        for(let h in wss){
          if(wss[h].trim() == w) ff = true;
        }
        //  If we found word in this row
        if(ff){
          //  Mark showmask
          let r = this.mask[m];
          for(let p in r){
            let l = r[p];
            //  If space, continue
            if(l.trim() === '') continue;

            let ind = parseInt(p);
            //  First check remaining length if it fit
            if(r.length < ind + w.length) break;

            //  Then check if letters match with word
            let wrd = w.split('');
            let word_detected = false;
            //  Search for first mistmach in letter sequence and continue
            for(let wi in wrd){
              let wli = parseInt(wi);
              if(wrd[wi] !== r[wli+ind]){
                word_detected = false;
                break;
              }
              word_detected = true;
            }
            //  If word is detected, change showmask
            if(word_detected){
              for(let wi in wrd){
                let wli = parseInt(wi);
                if(!only_hiligh) this.showmask[parseInt(m)][wli+ind] = true;
                this.hlmask[parseInt(m)][wli+ind] = true;
              }
              console.log(this.showmask);
              if(!only_hiligh) this.clearHL();
              return;
            }
          }
        }
      }

      //  Next check verical words
      for(let m in this.revmask){
        let wss = this.revmask[m].join('').split(' ');
        //  Issue with indexOf method, from split() it sometimes returns -1 on existing element, problem is extra characters, need trim
        let ff = false;
        for(let h in wss){
          if(wss[h].trim() == w) ff = true;
        }
        //  If we found word in this row
        if(ff){
          //  Mark showmask
          let r = this.revmask[m];
          for(let p in r){
            let l = r[p];
            //  If space, continue
            if(l.trim() === '') continue;

            let ind = parseInt(p);
            //  First check remaining length if it fit
            if(r.length < ind + w.length) break;

            //  Then check if letters match with word
            let wrd = w.split('');
            let word_detected = false;
            //  Search for first mistmach in letter sequence and continue
            for(let wi in wrd){
              let wli = parseInt(wi);
              if(wrd[wi] !== r[wli+ind]){
                word_detected = false;
                break;
              }
              word_detected = true;
            }
            //  If word is detected, change showmask
            if(word_detected){
              for(let wi in wrd){
                let wli = parseInt(wi);
                if(!only_hiligh) this.showmask[wli+ind][parseInt(m)] = true;
                this.hlmask[wli+ind][parseInt(m)] = true;
              }
              console.log(this.showmask);
              if(!only_hiligh) this.clearHL();
              return;
            }
          }
        }
      }

    }

    //	Shuffles array in place.
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

    //  Show next sentence
    showNextSentence() {
      //  Check if we reach last
      if(this.current_set < this.cr_questionstodisplay.length){
        let s = this.cr_questionstodisplay[this.current_set];
        this.expected_string = '';
        let wr = this.cr_questions[this.current_set].match(/\([a-zA-Z]*\)/ig);
        if(wr && wr.length > 0) this.expected_string = wr[0].replace('(', '').replace(')', '');
        this.card_instance = this.cr_questions[this.current_set];
        this.current_presented++;
        this.current_set++;
        this.answer_received = false;
        this.card.content[0].desc = s;
        this.setGlobalDesc(s);
        this.showWord(this.expected_string, true);
        this.question_ready = true;
      } else {
        this.showResults();
      }
      
    }

    //  Handle user answer
    handleAnswer(w) {
      if(this.answer_received) return;
      let that = this;
      this.question_ready = false;
      if(w === this.expected_string){
        this.showWord(w);
        //this.playmedia.word(w, ()=>{
          that.playmedia.action('DING', function(){
          //  that.showNextSentence();
            that.playContentDescription();
          });
        //}, 300);
        

        //  Save result
        if(!this.answer_received) this.display_result.right++;
      } else {
        //	Logging wrong answer
        this.input_data = w;
        this.result();
        //	Play wrong sound and show right answer
        //this.playmedia.action('CHONG', function(){});
        this.respIfIncorrect();
        if(!this.answer_received) this.display_result.wrong++;
      }
      this.answer_received = true;
    }

    showResults(){
      
      this.card.content[0].desc = '';
  
      this.elm.nativeElement.querySelector('.cr-words').style.display = 'none';
      this.elm.nativeElement.querySelector('.cr-layout').style.display = 'none';
      this.elm.nativeElement.querySelector('.gsc-results').style.display = 'block';
      let that = this;
      //	Play chimes
      this.playmedia.action('CHIMES', function(){
        that.uinputph = 'finish';
        that.enter();
      }, 300);
  
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

    //  Resp if incorrect
    respIfIncorrect() {
		
      let that = this;
  
  
        that.lastUncomplete = that.card.content[0].RespIfIncorrect[0];
        let i = that.card.content[0].RespIfIncorrect[0];
        that.card.content[0].desc = i.pointer_to_value;
        that.setGlobalDesc(i.pointer_to_value);
        if(typeof i.audio !== 'undefined' && i.audio !== ''){
          that.playmedia.sound(i.audio, function(){
            
            that.lastUncomplete = that.card.content[0].RespIfIncorrect[1];
            let i = that.card.content[0].RespIfIncorrect[1];
            that.card.content[0].desc = i.pointer_to_value;
            that.setGlobalDesc(i.pointer_to_value);
            if(typeof i.audio !== 'undefined' && i.audio !== ''){
                that.playmedia.sound(i.audio, function(){
                  that.showWord(that.expected_string);
                  that.playContentDescription();
                });
                that.playmedia.word(that.expected_string, function(){});
            }
          });
        }
        
      
    }

}
