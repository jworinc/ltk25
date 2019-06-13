import { Injectable } from '@angular/core';
import { CardItem } from '../card-item';
import { AuditoryComponent } from '../tests/auditory/auditory.component';
import { ComprehensionComponent } from '../tests/comprehension/comprehension.component';
import { SpellingComponent } from '../tests/spelling/spelling.component';

@Injectable({
  providedIn: 'root'
})
export class TestbuilderService {

  constructor() { }

  getTests(data) {

    let out = [];

    for(let i in data){

      let c = data[i];
      //c.pos = (data.length - 1) - parseInt(i);
      c.pos = parseInt(c.position);
      if(c.type === 'aud') out.push(new CardItem(AuditoryComponent, c));
      if(c.type === 'cmp') out.push(new CardItem(ComprehensionComponent, c));
      if(c.type === 'spl') out.push(new CardItem(SpellingComponent, c));

    }

    return out;

  }

}
