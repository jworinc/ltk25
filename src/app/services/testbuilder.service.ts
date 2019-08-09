import { Injectable } from '@angular/core';
import { CardItem } from '../card-item';
import { AuditoryComponent } from '../tests/auditory/auditory.component';
import { ComprehensionComponent } from '../tests/comprehension/comprehension.component';
import { SpellingComponent } from '../tests/spelling/spelling.component';
import { IntroComponent } from '../tests/intro/intro.component';
import { ResultsComponent } from '../tests/results/results.component';

@Injectable({
  providedIn: 'root'
})
export class TestbuilderService {

  constructor() { }

  public ttypes = [
      {type: 'aud', desc: 'Auditory Test'},
      {type: 'cmp', desc: 'Comprehension Test'},
      {type: 'spl', desc: 'Spelling Test'}
  ];

  public results = [];

  getDescription(type) {
    for(let i in this.ttypes) if(this.ttypes[i].type === type) return this.ttypes[i].desc;
    return '';
  }

  //      Test result structure

  /*   [
            {type: 'type', desc: 'desc', presented: num(integer), wrong: num(integer)}
            ...
       ]
  */

  addResultItem(t, results) {

    // Check if we already have result for current test type then return
    for(let i in results) if(t.type === results[i].type) return;

    //  Check if test type in available list
    let approve = false;
    for(let i in this.ttypes) if(t.type === this.ttypes[i].type) approve = true;

    //  Add new result item
    if(approve) results.push({type: t.type, desc: this.getDescription(t.type), presented: 0, wrong: 0, details: []});

  }

  clearResults(results) {
    for(let i in results){
        results[i].presented = 0;
        results[i].wrong = 0;
        results[i].details = [];
    }
  }

  getResultsInst(data) {
    let result = [];
    for(let i in data){

      let c = data[i];
      this.addResultItem(c, result);

    }
    return result;
  }

  addResult(type, presented, wrong, details, results) {
    for(let i in results){
      if(type === results[i].type) {
        results[i].presented += presented;
        results[i].wrong += wrong;
        results[i].details = results[i].details.concat(details); 
      }
    } 
  }

  getTests(data) {

    let out = [];

    for(let i in data){

      let c = data[i];
      //c.pos = (data.length - 1) - parseInt(i);
      c.pos = parseInt(c.position);
      if(c.type === 'aud') out.push(new CardItem(AuditoryComponent, c));
      if(c.type === 'cmp') out.push(new CardItem(ComprehensionComponent, c));
      if(c.type === 'spl') out.push(new CardItem(SpellingComponent, c));
      if(c.type === 'intro') out.push(new CardItem(IntroComponent, c));
      if(c.type === 'results') out.push(new CardItem(ResultsComponent, c));

    }

    return out;

  }

}
