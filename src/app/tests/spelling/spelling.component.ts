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

  constructor(private element:ElementRef, private sz: DomSanitizer, private pms: PlaymediaService) { 
    super(element, sz, pms);
  }

  ngOnInit() {
  }

  show() {
    console.log(this.data);
    // this.card = this.data['content'];
    this.ind = 0;
    this.result = [];
    this.getWords();
    // //this.pms.word(this.data['description'],function(){});
    // console.log(this.card);
    // this.ind = 0;
    // this.count = 0;
    // this.isResult = false;
    // this.getWords();
  }

  // getWords(){
  //   this.pms.word(this.card[this.ind].answer.wavename,function(){});
  //   this.words = this.card[this.ind].words;
  // }

  getNext(){
    this.ind++;
    if(this.ind < this.data.content.length)
    this.getWords();
    else
    setTimeout(()=>{ this.next(); }, 2000);
  }

  getResult(){
      this.isResult = true;
  }

  // getAnswer(answer){
  //   let data;
  //   if(this.result.length != this.card.length){
  //     if(answer ===  this.card[this.ind].answer.title){
  //       //this.count++;
  //       data = { "isCorrect" : true, "word":answer}
  //     }else{
  //       data = { "isCorrect" : false, "word":answer}
  //     }
  //     this.result.push(data);
  //     //this.getNext();
  //   }
    
  // }

  public content = '';
  public r: any;
  public entered_val = '';
  getWords(){
    this.content = '';
    //console.log(word);
    //console.log(word.search(/\|{1}[A-Za-z]+\|{1}/));

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
				cn = cn.replace(r, "<input class='card-ar1-digraph-input' id='user_input' type='text' maxlength = '1' />");
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
        //this.getAnswer();
      };
      
      inps.style.backgroundColor = 'rgb(114, 90, 63)';

    },10);

  }

  enter(){
    this.getAnswer();
  }

  getAnswer() {
    let data;
    if(this.entered_val != '' && this.entered_val != ' ' && this.ind < this.data.content.length){
      console.log(this.entered_val + " " +this.data.content[this.ind].missing);

      
      console.log();

      if(this.entered_val === this.data.content[this.ind].missing){
        console.log("true");
        data = { "isCorrect" : true, "word":this.words.replace(/,/g , "")}
        
      }else{
        console.log("false");
        data = { "isCorrect" : false, "word":this.words.replace(/,/g , "")}
      }
      this.result.push(data);

      this.getNext();
    }
    

  }

}
