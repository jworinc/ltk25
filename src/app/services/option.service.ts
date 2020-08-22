import { Injectable, EventEmitter } from '@angular/core';
import { DataloaderService } from './dataloader.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OptionService {

  public langs: any = [
    {
      'title': 'English',
      'lang': 'english',
      'locale': 'en'
    },
    /*
    {
      'title': 'Русский',
      'language': 'russian',
      'locale': 'ru'
    },
    {
      'title': 'Türk',
      'language': 'turkish',
      'locale': 'tr'
    },
    */
  ];

  public current_locale = 'en';
  public current_fallback_locale = 'en';
  public current_language = 'english';
  public change_language_event = new EventEmitter<boolean>();
  public last_requested_lang = '';
  public pause_on_instruction: boolean = false;
  public show_word_translation: boolean = true;

  public opt: any;
  public break_tests = [
    {break: 1, test: 'b1t', alias: 'test'},
    {break: 2, test: 'b2t', alias: 'test'},
    {break: 3, test: 'b3t', alias: 'test'},
    {break: 4, test: 'b4t', alias: 'test'},
    {break: 5, test: 'b5t', alias: 'test'}
  ]

  constructor(private dl: DataloaderService) {
    let that = this;
    dl.getLocales().subscribe((e)=>{
      that.langs = e;
      if(that.last_requested_lang !== ''){
        that.setLanguage(that.last_requested_lang);
      }
    });
    this.opt = {
        expertlevel: "2",
        language: "english",
        mic: "50",
        quickpace: "1",
        replevel: "50",
        screencolor: "1",
        volume: "1"
    }
  }

  getOptions() { return this.opt; }

  setOptions(options) {
    this.opt = options;
  }

  getLocale() {
  	return this.current_locale;	
  }

  getFallbackLocale() {
  	return this.current_fallback_locale;
  }

  setLanguage(lang){
    this.last_requested_lang = lang;
    for(let i in this.langs){
      if(lang === this.langs[i].lang){
        this.current_locale = this.langs[i].locale;
        this.current_language = this.langs[i].lang;
        this.change_language_event.emit();
        this.dl.setLocale(this.current_locale);
        break;
      }
    }
  }

  setLocale(loc){
    for(let i in this.langs){
      if(loc === this.langs[i].locale){
        this.current_locale = this.langs[i].locale;
        this.current_language = this.langs[i].lang;
        this.change_language_event.emit();
        this.dl.setLocale(this.current_locale);
        break;
      }
    }
  }

  getMediaStorage() {
  	return environment.baseMedia;
  }
  
  getLocales() {
    return this.langs;
  }

  pauseOnInstruction() {
    return this.pause_on_instruction;
  }

  enablePauseOnInstruction() {
    this.pause_on_instruction = true;
  }

  disablePauseOnInstruction() {
    this.pause_on_instruction = false;
  }

  breakTestEnabled() {
    if(this.opt)
      return this.opt.bt_enable;
    else return false;
  }

  getBreakTest(b) {
    for(let i in this.break_tests) if(b == this.break_tests[i].break) return this.break_tests[i];
    return null;
  }
}
