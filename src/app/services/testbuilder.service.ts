import { Injectable } from '@angular/core';
import { CardItem } from '../card-item';
import { AuditoryComponent } from '../tests/auditory/auditory.component';
import { ComprehensionComponent } from '../tests/comprehension/comprehension.component';
import { SpellingComponent } from '../tests/spelling/spelling.component';
import { IntroComponent } from '../tests/intro/intro.component';
import { ResultsComponent } from '../tests/results/results.component';
import { TranslateService } from '@ngx-translate/core';
<<<<<<< HEAD
=======
import { DataloaderService } from '../services/dataloader.service';
import { ResultItem } from '../tests/result.item';
import { CftComponent } from '../tests/cft/cft.component';

export interface TestFlowItem {
  position: number;
  type: string;
  level: number;
}
>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results

@Injectable({
  providedIn: 'root'
})
export class TestbuilderService {

  constructor(private translation: TranslateService) { }

  public ttypes = [
      {type: 'aud', desc: 'Auditory Test', trans: 'auditory_test'},
      {type: 'cmp', desc: 'Comprehension Test', trans: 'comprehension_test'},
      {type: 'spl', desc: 'Spelling Test', trans: 'spelling_test'}
  ];

<<<<<<< HEAD
  public results = [];

=======
  public breaks = [
    {break: "Break1"},
    {break: "Break2"},
    {break: "Break3"},
    {break: "Break4"},
    {break: "Break5"},
  ];

  public result_log = [];

  /*
  public standart = [
    {break: "Break1", aud: 60, cmp: 60, spl: 0, title: "A1 Beginner"},
    {break: "Break2", aud: 70, cmp: 70, spl: 70, title: "A1 Elementary"},
    {break: "Break3", aud: 80, cmp: 80, spl: 80, title: "A2 Pre-Intermediate"},
    {break: "Break4", aud: 90, cmp: 90, spl: 90, title: "B1 Intermediate"},
    {break: "Break5", aud: 95, cmp: 95, spl: 95, title: "B2 Upper- Intermediate"},
  ]
  */
  public standart: any = null;

  public results: ResultItem[] = [];

  public test_break_positions = [];

  public end_position = 0;

  public min_res_items = 1;

  public assesment_loaded: boolean = false;

  public test_flow: TestFlowItem[] = [];

  async getLevels() {
    let lvs = await this.dl.getAssesmentLevels();
    console.log("Assestment levels for current test");
    console.log(lvs);
    this.assesment_loaded = true;
    this.standart = lvs[0];
  }

  addTestBreakPosition(br, start, end) {
    this.test_break_positions.push({break: br, start: start, end: end});
  }

  getResultStatusForBreak(br, res) {
    let r = true;
    let bad_levels = [];
    let good_levels = [];
    //let s = this.standart[br];
    let s = this.standart;
    let b = br + 1;
    for(let i in res){
      /*
      if(res[i].type === 'aud' && res[i].res >= s.aud) continue;
      else if(res[i].type === 'cmp' && res[i].res >= s.cmp) continue;
      else if(res[i].type === 'spl' && res[i].res >= s.spl) continue;
      else {
        r = false;
        break;
      }
      */
      
      for(let k in s){
        if(res[i].type === s[k].type && s[k].break === b && res[i].res < parseInt(s[k].value)){
          r = false;
          bad_levels.push(s[k]);
        }
        else if(res[i].type === s[k].type && s[k].break === b && res[i].res >= parseInt(s[k].value)){
          good_levels.push(s[k]);
        }
      }

    }
    return {status: r, bad: bad_levels, good: good_levels};
  }

>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results
  getDescription(type) {
    for(let i in this.ttypes) if(this.ttypes[i].type === type) return this.translation.instant(this.ttypes[i].trans);
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
    let approve = true;
    //for(let i in this.ttypes) if(t.type === this.ttypes[i].type) approve = true;
    if(t.type === "intro" || t.type === "resultspcm" || t.type === "results" || t.type === "cft") approve = false;

    //  Add new result item
<<<<<<< HEAD
    if(approve) results.push({type: t.type, desc: this.getDescription(t.type), presented: 0, wrong: 0, details: []});
=======
    //if(approve) results.push({type: t.type, desc: this.getDescription(t.type), presented: 0, wrong: 0, count: 0, details: []});
    if(approve) results.push({type: t.type, desc: t.description, presented: 0, wrong: 0, count: 0, details: []});
>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results

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
  /*
  addResult(type, presented, wrong, details, results) {
    for(let i in results){
      if(type === results[i].type) {
        results[i].presented += presented;
        results[i].wrong += wrong;
        results[i].details = results[i].details.concat(details); 
      }
    } 
  }
  */

addResult(r: ResultItem) {
  this.results.push(r);
}

deleteResults() {
  this.results = [];
}

  getTests(data) {

    let out = [];
    
    //  Clear test flow for a new test
    this.test_flow = [];

    for(let i in data){

      let c = data[i];
      //c.pos = (data.length - 1) - parseInt(i);
      c.pos = parseInt(c.position);
      if(c.type === 'aud') out.push(new CardItem(AuditoryComponent, c));
      if(c.type === 'cmp') out.push(new CardItem(ComprehensionComponent, c));
      if(c.type === 'spl') out.push(new CardItem(SpellingComponent, c));
      if(c.type === 'intro') out.push(new CardItem(IntroComponent, c));
      if(c.type === 'results') out.push(new CardItem(ResultsComponent, c));
<<<<<<< HEAD
=======
      if(c.type === 'resultspcm') out.push(new CardItem(ResultspcmComponent, c));
      if(c.type === 'audt') out.push(new CardItem(AuditoryComponent, c));
      if(c.type === 'cmpt') out.push(new CardItem(ComprehensionComponent, c));
      if(c.type === 'splt') out.push(new CardItem(SpellingComponent, c));
      if(c.type === 'cft') out.push(new CardItem(CftComponent, c));

      this.test_flow.push({position: c.pos, type: c.type, level: parseInt(c.break)});
>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results

    }

    return out;

  }

<<<<<<< HEAD
=======
  getLevelByResults(res){

    //  Get max reached level for each test type
    let lvs = [];
    for(let i in res) {
      let r = res[i];
      let l = null;
      lvs.map((lv, index)=>{ if(lv.type === r.type) l = index; });
      if(l === null) {
        lvs.push(r);
        continue;
      } else {
        if(r.level > lvs[l].level) lvs[l] = r;
      }
    }

    //  Get lowest level
    let ll = null;
    let last_level = 100;
    let last_success = 100;
    for(let i in lvs) {
      if(lvs[i].level < last_level) {
        last_level = lvs[i].level;
        last_success = lvs[i].value;
        ll = lvs[i];
      }
      else if(lvs[i].level == last_level) {
        //  Compare for lowest success
        if(lvs[i].value < last_success) {
          last_level = lvs[i].level;
          last_success = lvs[i].value;
          ll = lvs[i];
        }
      }
    }

    //  Get assessment level
    if(ll) {
      let al = [];
      this.standart.map((l)=>{ if(parseInt(l.break) === ll.level && l.test_type == ll.type) al.push(l); });
      //  If there is only one assessment record for current level, return it
      if(al.length == 1) return al[0];
      else {
        //  If there are several records, get lowest success which is higher than difined for current level
        let ldl = null;
        let ilv = [];
        //  Get all levels which success is higher than result success
        al.map((a)=>{
          if(a.value > ll.average) ilv.push(a);
        });
        
        //  If ivl is empty, it means that result is higher than assessment standard max value
        //  in this case we return last level
        if(ilv.length == 0) return this.standart[this.standart.length - 1];

        // Get lowest from intermediate levels
        ilv.map((a)=>{
          if(!ldl || ldl.value < a.value) ldl = a;
        });

        return ldl;
      }
    } else {
      return this.standart[0];
    }

  }

  /*
  getLevelByResults(res){
    let lsb = -1;
    let st: any = null;

    //  Get last success break
    for(let i in res) {
      let cr = [];
      for(let l in res[i]){
        cr.push({type: res[i][l].type, res: Math.round(((res[i][l].presented-res[i][l].wrong)/res[i][l].presented)*100), attempts: res[i][l].count, break: parseInt(i)+1});
      }
      st = this.getResultStatusForBreak(parseInt(i), cr);
      this.result_log.push(cr);
      if(st.status) lsb = parseInt(i);
      else break;
    }

    //  Get last success level
    console.log(st);
    console.log(this.result_log);

    let lsl = this.standart[0];
    //if(st.good.length > 0) lsl = st.good[st.good.length - 1].level;
    if(st.bad.length > 0) {
      //  Find index of first bad, level before it will success
      let s = this.standart;
      let si = 0;
      for(let i in s){
        if(s[i].id === st.bad[0].id){
          si = parseInt(i);
          break;
        }
      }

      //  If si is 0, set first level
      if(si === 0) lsl = s[0];
      else {
        //  Find first step down level
        for(let i = si; i >= 0; i--){
          if(s[i].level !== s[si].level){
            lsl = s[i];
            break;
          }
        }
      }

    } 
    else if(st.good.length > 0){
      lsl = st.good[st.good.length - 1];
    }


    if(lsb > 0 && lsb < 4) return {level: lsl.level, start: this.breaks[lsb+1].break, break: lsb+1, lesson: lsl.lesson};
    if(lsb > 0 && lsb >= 4) return {level: lsl.level, start: this.breaks[4].break, break: 5, lesson: lsl.lesson};
    else return {level: lsl.level, start: this.breaks[0].break, break: 1, lesson: lsl.lesson};
    //return {level: "Your level: ", start: "Start LTK from "};

  }
  */

  /*
  getNextPosition(current_position, test_results) {
    let p = current_position + 1;
    let br = this.getCurrentBreak(current_position);
    let r = test_results[br];

    //  Check if results has min count of items
    for(let i in r){
      if(r[i].count < this.min_res_items) return p;
    }

    let res = [];

    //  Get average results for all tests
    for(let i in r){
      res.push({type: r[i].type, res: Math.round(((r[i].presented-r[i].wrong)/r[i].presented)*100), attempts: r[i].count});
    }
  
    console.log(res);

    //  Check if result is good or not
    if(this.getResultStatusForBreak(br, res).status){
        //  If good result, try to go to next break or to finish if break is last
        if(br < this.test_break_positions.length-1) {
          return this.test_break_positions[br + 1].start;
        } else {
          return this.end_position;
        }
    } else {
      //  Check if we reached last test in current break and stop the test
      if(current_position === this.test_break_positions[br].end) return this.end_position;
    }

    return p;
  }
  */

  combineResults() {

    //  Split results by level
    let r = [];
    for(let i in this.results) {
      let level = this.results[i].level;
      let type = this.results[i].type;
      let description = this.results[i].description;
      //  Check if level exists
      let le = null;
      for(let k in r) { if(r[k].level === level && r[k].type == type) { le = r[k]; break; } }
      if(!le) { le = {level: level, type: type, success: [], average: 0, description: description, presented: 0, wrong: 0, details: [], treshold: 0}; r.push(le); }
      le.success.push(this.results[i].getSuccess());
      le.presented += this.results[i].presented;
      le.wrong += this.results[i].wrong;
      le.details = le.details.concat(this.results[i].details);
      le.treshold = this.results[i].treshold;
    }
    
    //  calc average for each level
    for(let k in r) { 
      let s = r[k].success;
      let sum = 0;
      for(let i in s) { sum +=s[i]; }
      //r[k].average = Math.round(sum / s.length);
      
      let clear_success = Math.round(sum / s.length);;
      //  Success without treshold
      let st = clear_success - r[k].treshold;
      //  Get percentage of corrected success, treshold correction
      let rs = 0;
      if(st > 0) rs = Math.round((st / (100 - r[k].treshold)) * 100);
      r[k].average = rs;
      
    };
    return r;
  }

  getNextPosition(cpos) {
    
    //  Get combined results
    let r = this.combineResults();

    //  Get flow item at current position
    let ficp = null;
    this.test_flow.map((i)=>{ if(i.position === cpos) ficp = i; });

    //  Get required assessment level
    let al = this.getAssessmentLevel(ficp);

    //  Get result inst according to current flow item
    let ri = null;
    r.map((res)=>{ if(res.level === ficp.level && res.type === ficp.type) ri = res; });

    //  Analize received data
    //  If success at current point is enough, go to next
    if(!ri || !al) return cpos + 1;
    if(ri.average >= al.value) return cpos + 1;

    //  If success is not enough, find next flow item which has different type or same type and level as current
    //  it needed for skipping steps wich has higher level than last unsuccess
    let finp = null;
    let pa = 1;
    do {
      this.test_flow.map((i)=>{ if(i.position === cpos + pa) finp = i; });
      pa++;
    } while(finp.level > ficp.level && finp.type === ficp.type);

    return finp.position;

  }

  getCurrentBreak(current_position) {
    let b = 0;
    for(let k in this.test_break_positions) {
      let t = this.test_break_positions[k];
      if(current_position >= t.start && current_position <= t.end){
        b = parseInt(k);
        console.log("Defined currnt break: "+t.break);
        break;
      }
    }
    return b;
  }

  getAssessmentLevel(i: TestFlowItem){
   let al = null;
   this.standart.map((l)=>{ if(parseInt(l.break) === i.level && l.test_type === i.type) al = l; });
   return al;
  }

>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results
}
