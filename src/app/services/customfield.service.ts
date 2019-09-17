import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomfieldService {

  constructor() { }

  public fields: any = [];

  public has_start_screen: boolean = false;
  public has_start_lesson: boolean = false;
  public has_end_screen: boolean = false;
  public has_end_lesson: boolean = false;

  setFields(fields) {

    this.fields = fields;
    this.checkFields();

  }

  checkFields() {

    this.has_start_screen = false;
    this.has_start_lesson = false;
    this.has_end_screen = false;
    this.has_end_lesson = false;

    for(let i in this.fields) {

      let f = this.fields[i];
      if(typeof f.place !== 'undefined'){
        if(f.place === 'lesson_begin') this.has_start_lesson = true;
        if(f.place === 'begin_screen') this.has_start_screen = true;
        if(f.place === 'lesson_end') this.has_end_lesson = true;
        if(f.place === 'end_screen') this.has_end_screen = true;
      }

    }

  }

  getStartLesson() {
    for(let i in this.fields) {
      let f = this.fields[i];
      if(typeof f.place !== 'undefined'){
        
        if(f.place === 'lesson_begin') return f.content;
        
      }
    }
    return '';
  }

  getStartScreen() {
    for(let i in this.fields) {
      let f = this.fields[i];
      if(typeof f.place !== 'undefined'){
        
        if(f.place === 'begin_screen') return f.content;
        
      }
    }
    return '';
  }

  getEndScreen() {
    for(let i in this.fields) {
      let f = this.fields[i];
      if(typeof f.place !== 'undefined'){
        
        if(f.place === 'end_screen') return f.content;
        
      }
    }
    return '';
  }

  getEndLesson() {
    for(let i in this.fields) {
      let f = this.fields[i];
      if(typeof f.place !== 'undefined'){
        
        if(f.place === 'lesson_end') return f.content;
        
      }
    }
    return '';
  }



}
