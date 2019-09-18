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

  addStartCardToLesson(cards, cpos) {
    let cfc = {
      activity: "CFC",
      audio: [],
      comment: "Custom field card lesson start",
      content: [this.getStartLesson()],
      cross_number: 1,
      display_number: 1,
      id: 0,
      lesson: "",
      pos: 2,
      position: 1,
      type: "cfc"
    }

    //  Increase all positions of cards
    for(let i in cards) {
      cards[i].pos++;
    }

    //  Add custom field card to cards list
    cards.push(cfc);

    //  Define current position depending on previous
    //  if lesson starts from begining (pos 2) then return 2
    //  else we have to shift by one card forward
    if(cpos === 2) return 2;
    else return cpos+1;

  }

  addEndCardToLesson(cards) {

    //  Get last card position
    let lcp = 0;
    for(let i in cards) {
      if(lcp < cards[i].pos) lcp = cards[i].pos;
    }

    let cfc = {
      activity: "CFC",
      audio: [],
      comment: "Custom field card lesson end",
      content: [this.getEndLesson()],
      cross_number: lcp,
      display_number: lcp,
      id: 0,
      lesson: "",
      pos: lcp,
      position: lcp,
      type: "cfc"
    }

    //  Add custom field card to cards list
    cards.push(cfc);

  }



}
