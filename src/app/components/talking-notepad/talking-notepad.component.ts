import { Component, OnInit } from '@angular/core';
import { PlaymediaService } from 'src/app/services/playmedia.service';
import { EventEmitter } from 'protractor';

@Component({
  selector: 'app-talking-notepad',
  templateUrl: './talking-notepad.component.html',
  styleUrls: ['./talking-notepad.component.scss']
})
export class TalkingNotepadComponent implements OnInit {
  message: string = '';
  subString: string = '';
  count = 0;
  pm_noword_event: any = null;

  constructor(private playmedia: PlaymediaService) { }

  ngOnInit() {
    this.pm_noword_event = this.playmedia.noWordFound.subscribe((res) => {
      if (res) {
        this.count = 0;
        this.playWordEndSound();
      }
    });
  }

  ngOnDestroy() {
    this.pm_noword_event.unsubscribe();
  }

  checkEndsWith(lastWord, endChar) {
    return lastWord.endsWith(endChar);
  }

  playWordEndSound() {
    const lastWord = this.getlastWord(this.message.trim());
    const _s = this.checkEndsWith(lastWord, 's');
    const _es = this.checkEndsWith(lastWord, 'es');
    const _ed = this.checkEndsWith(lastWord, 'ed');
    const _ing = this.checkEndsWith(lastWord, 'ing');

    if (this.subString !== '') {
      this.playmedia.action('DING', () => { });
      this.count = 1;
      return;
    }

    if (!_s && !_es && !_ed && !_ing) {
      this.playmedia.action('DING', () => { });
      this.count = 1;
      return;
    } else {
      if (_s) {
        this.subString = lastWord.substring(0, lastWord.length - 1);
      }
      if (_es || _ed) {
        this.subString = lastWord.substring(0, lastWord.length - 2);
      }
      if (_ing) {
        this.subString = lastWord.substring(0, lastWord.length - 3);
      }
      // this.playmedia.noWordFound.emit(false);
      const path = _s ? '_S/_SS' :
        _es ? '_E/_SES' : _ed ? '_E/_SED' : _ing ? '_I/_SING' : '';
      this.playmedia.playTalk(this.subString, () => {
        this.playmedia.noWordFound.subscribe((res) => {
          if (!res && this.count == 0) {
            this.count = 1;
            this.playmedia.action(path, () => { });
          }
        });
      });



    }
  }

  playWord() {
    if (!this.message || this.message === '' || this.message.trim() === '') {
      return;
    }
    this.playmedia.stop();
    this.subString = '';
    this.playmedia.playTalk(this.getlastWord(this.message.trim()), () => {
    });
  }

  getlastWord(message): string {
    this.playmedia.stop();
    if(typeof message !== 'undefined' && message !== ''){
      let mtchs = message.match(/\w+$/);
      if(mtchs && mtchs.length > 0) {
        const lastWord = mtchs[0];
        return lastWord;
      } else return "";
     
    } else return "";
    
  }

}
