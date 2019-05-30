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

  public opt = {
      expertlevel: "2",
      language: "english",
      mic: "50",
      quickpace: "1",
      replevel: "50",
      screencolor: "1",
      volume: "1"
  }

  constructor(private dl: DataloaderService) {
    let that = this;
    dl.getLocales().subscribe((e)=>{
      that.langs = e;
      if(that.last_requested_lang !== ''){
        that.setLanguage(that.last_requested_lang);
      }
    })
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


}
