import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { PlaymediaService } from '../../services/playmedia.service';
import { ColorschemeService } from '../../services/colorscheme.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-gdn',
  templateUrl: './gdn.component.html',
  styleUrls: ['./gdn.component.scss'],
  host: { 'class': 'book-wrapper-slide' }
})
export class GdnComponent extends BaseComponent implements OnInit {
  getAllSpelling = [];
  currentSpelling: string;
  rightAnswer = 0;
  wrongAnswer = 0;
  showResult: boolean;
  hideContent: boolean;

  constructor(private elm: ElementRef, private sanitizer: DomSanitizer, private playmedia: PlaymediaService, private gdnlog: LoggingService, private gdncs: ColorschemeService) {
    super(elm, sanitizer, playmedia, gdnlog, gdncs);
  }

  ngOnInit() {
    this.setHeader();
    this.setCardNumber();

    this.card = this.data;

    this.current_header = this.card.header;
    this.data.content[0].parts.map((data) => {
      this.getAllSpelling.push(data.title);
    });
    this.currentSpelling = this.data.content[0].parts[0].title
    this.showResult = false;
    this.hideContent = true;
    console.log("this.data.content[0].parts: ", this.data.content[0].parts);
    console.log("this.data.content[0].parts: ", this.data.content[0].parts);
    this.card_object = 'Sound';
  }


  //	Set header for current card
  public current_header = '';

  //	User answer phases, rec, listen, compare, split to syllables, finish
  public uinputph = 'rec';

  public input_data = '';


  public current_set = 0;
  public expected_string: any;
  public current_word: any;

  //	Validation of user input
  validate() {
    if (this.uinputph === 'finish')
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

  repeat() {
    if (this.uinputph !== 'finish') {
      this.playCardDescription();
    } else {
      this.enter();
    }
  }

  //	Used to play task word and sound exactly after instructions play finished
  playContentDescription() {
    this.playmedia.word(this.currentSpelling, function () { }, 300);
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

  hide() {
    this.prevent_dubling_flag = false;
    //	Hide option buttons
    this.optionHide();
  }

  setFocus() {

  };

  //	Enter click handler
  enter() {
    if (this.uinputph === 'finish') {
      this.enableNextCard();
    }
  }

  submitAnswer = async (getAnswer, currentValue) => {
    let spellingData, breakdown;
    this.input_data = getAnswer ? 'Yes' : 'No';
    if (this.getAllSpelling.indexOf(currentValue) != -1) {
      spellingData = this.data.content[0].parts.find((data) => { return data.title === currentValue });
      breakdown = spellingData.breakdown.split(",");
      let ll = breakdown[breakdown.length - 1];
      ll = ll.split('');
      if (ll.length == 2 && getAnswer == true && ll[0] == ll[1]) {
        this.rightAnswer += 1;
      } else if ((ll.length == 1 && getAnswer == false) || (ll.length == 2 && getAnswer == false && ll[0] !== ll[1])) {
        this.rightAnswer += 1;
      } else {
        this.wrongAnswer += 1;
        this.card_instance = this.currentSpelling;
        this.expected_string = this.currentSpelling;
        this.result();
      }
      this.getAllSpelling.splice(currentValue, 1);
      this.currentSpelling = this.getAllSpelling[0];
      this.currentSpelling && this.playmedia.word(this.currentSpelling, function () { }, 300);
      this.current_presented++;
    }
    if (this.getAllSpelling.length <= 0) {
      this.elm.nativeElement.querySelector('.card-description-wrap-ar2').style.display = 'none';
      this.showResult = true;
      this.hideContent = false;
      let that = this;
      this.playmedia.action('CHIMES', function(){
        that.uinputph = 'finish';
        that.enter();
      }, 300);
    }
  }

}
