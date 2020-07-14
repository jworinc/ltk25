import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BasetestComponent } from '../basetest/basetest.component';
import { PlaymediaService } from '../../services/playmedia.service';


@Component({
  selector: 'app-spelling',
  templateUrl: './spelling.component.html',
  styleUrls: ['./spelling.component.scss'],
  host: {'class': 'book-wrapper-slide test-wrapper-slide'}
})
export class SpellingComponent extends BasetestComponent implements OnInit {

  public card:any;
  public words:any;
  public ind = 0;
  public count = 0;
  public isResult:boolean = false;

  public result:any= [];
  public test_complete = false;
  public variants: string[] = [];
  public var_for_display: string[] = [];

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
    this.card = this.data;
    this.getLettersForVariants(this.data);
  }

  show() {
    console.log(this.data);
    // this.card = this.data['content'];
    this.ind = 0;
    this.result = [];
    this.test_complete = false;
    this.getWords();
    
  }

  // getWords(){
  //   this.pms.word(this.card[this.ind].answer.wavename,function(){});
  //   this.words = this.card[this.ind].words;
  // }

  getNext(){
    this.ind++;
    if(this.ind < this.data.content.length)
    this.getWords();
    else{
      let that = this;
      this.test_complete = true;
      setTimeout(()=>{
        //that.saveResults({type: that.card.type, presented: that.presented, wrong: that.wrong});
        that.next(); 
      }, 2000);
    }
    
  }

  getResult(){
      this.isResult = true;
  }

  public content = '';
  public r: any;
  public entered_val = '';
  getWords(){
    this.content = '';
    
    let content = '';

		//	Digraph test regex
		let r = null;
    this.r = r = /\|{1}[A-Za-z]+\|{1}/;
    
    let w = this.data.content[this.ind].parts.toString();
    this.words = w.replace(this.r,this.data.content[this.ind].missing);

    this.pms.word(this.words.replace(/,/g , ""),function(){});

		//	Add word parts to markup
		for(let i in this.data.content[this.ind].parts){

			let cn = this.data.content[this.ind].parts[i].replace(/\-/ig, '');

			//	Create box for digraph
			if(typeof cn !== 'undefined' && cn !== '' && r.test(cn)) {
				cn = cn.replace(r, "<input class='card-ar1-digraph-input' id='user_input' type='text' maxlength = '1' disabled='disabled' />");
				content += "<span class='card-ar2-syllable card-ar1-syllable'>"+cn+"</span>";
			}
			//	Create box for normal letters
			else if(typeof cn !== 'undefined' && cn !== '') {
				content += "<span class='card-ar2-syllable card-ar1-syllable'>"+cn+"</span>";
			}

		}

    this.content = content;
    let that = this;
    setTimeout(()=>{
      let inps = this.element.nativeElement.querySelector('#user_input');
      if(inps !== null)
      inps.focus();

      inps.oninput = (e)=>{
        //that.enter(e);
        this.entered_val = e.target.value;
        this.getAnswer();
      };

      inps.style.backgroundColor = 'rgb(114, 90, 63)';

    },10);

    //  Get variants for multi-select
    if(this.variants.length >= 3) this.var_for_display = this.shuffle(this.variants).slice(0, 3);
    else if(this.variants.length < 2) {
      //  push static variants if letters not exists
      this.variants.push('a');
      this.variants.push('u');
      this.var_for_display = this.shuffle(this.variants);
    }
    else this.var_for_display = this.shuffle(this.variants);
    if(this.var_for_display.indexOf(this.data.content[this.ind].missing) < 0) {
      let trimmed = this.var_for_display.slice(0, 2);
      trimmed.push(this.data.content[this.ind].missing);
      this.var_for_display = this.shuffle(trimmed);
    }

    this.presented++;

  }

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

  enter(){
    //this.getAnswer();
  }

  setAnswerLetter(l) {
    this.entered_val = l;
    let ielm = this.element.nativeElement.querySelector('#user_input');
    if(ielm) ielm.value = l;
    this.getAnswer();
  }

  getAnswer() {
    let data;
    if(this.entered_val != '' && this.entered_val != ' ' && this.ind < this.data.content.length){
      console.log(this.entered_val + " " +this.data.content[this.ind].missing);

      
      console.log();

      if(this.entered_val === this.data.content[this.ind].missing){
        console.log("true");
        data = { "isCorrect" : true, "word":this.words.replace(/,/g , ""), "answer": this.entered_val, "expected": this.data.content[this.ind].missing};
        
      }else{
        console.log("false");
        data = { "isCorrect" : false, "word":this.words.replace(/,/g , ""), "answer": this.entered_val, "expected": this.data.content[this.ind].missing};
        this.wrong++;
      }
      this.result.push(data);

      this.getNext();
    }
    

  }

  
  getTestResult() {
    if(this.test_complete) return this.saveResults({type: this.card.type, presented: this.presented, wrong: this.wrong, results: this.result});
    return null;
  }

  //  Define unique letters for variants
  getLettersForVariants(data) {
    for(let i in data.content) {
      let c = data.content[i];
      if(this.variants.indexOf(c.missing) < 0) {
        this.variants.push(c.missing);
      }
    }
  }

  repeat() {
    this.pms.stop();
    this.pms.word(this.words.replace(/,/g , ""),function(){});
  }



}
