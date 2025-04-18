import { useState } from 'react';
import { useDataloader } from './useDataloader';
import { useTranslation } from 'react-i18next';
import { testStepComponentMap } from './TestStepComponents';
import React from 'react';

export interface TestFlowItem {
  position: number;
  type: string;
  level: number;
}

export interface ResultItem {
  type: string;
  desc: string;
  presented: number;
  wrong: number;
  level: number;
  inst?: any;
  description?: string;
  details?: any[];
  treshold?: number;
  getSuccess?: () => number;
  [key: string]: any;
} // Allow for extra properties

export function useTestBuilder() {
  const dl = useDataloader();
  const { t } = useTranslation();
  const [ttypes] = useState([
    { type: 'aud', desc: 'Auditory Test', trans: 'auditory_test' },
    { type: 'cmp', desc: 'Comprehension Test', trans: 'comprehension_test' },
    { type: 'spl', desc: 'Spelling Test', trans: 'spelling_test' },
    { type: 'intro', desc: 'Intro', trans: 'intro' },
    { type: 'results', desc: 'Results', trans: 'results' },
    { type: 'resultspcm', desc: 'Results PCM', trans: 'resultspcm' },
    { type: 'cft', desc: 'CFT', trans: 'cft' },
  ]);
  const [breaks] = useState([
    { break: 'Break1' },
    { break: 'Break2' },
    { break: 'Break3' },
    { break: 'Break4' },
    { break: 'Break5' },
  ]);
  const [standart, setStandart] = useState<any>(null);
  const [assesmentLoaded, setAssesmentLoaded] = useState(false);
  const [testFlow, setTestFlow] = useState<TestFlowItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [testBreakPositions, setTestBreakPositions] = useState<any[]>([]);
  const [endPosition, setEndPosition] = useState(0);
  const [minResItems] = useState(1);

  // Loads assessment levels from API
  const getLevels = async () => {
    const lvs = await dl.getAssesmentLevels();
    setAssesmentLoaded(true);
    setStandart(lvs[0]);
    return lvs[0];
  };

  const addTestBreakPosition = (br: any, start: number, end: number) => {
    setTestBreakPositions(prev => [...prev, { break: br, start, end }]);
  };

  const getResultStatusForBreak = (br: number, res: any[]) => {
    let r = true;
    let bad_levels: any[] = [];
    let good_levels: any[] = [];
    let s = standart;
    let b = br + 1;
    for (let i in res) {
      for (let k in s) {
        if (res[i].type === s[k].type && s[k].break === b && res[i].res < parseInt(s[k].value)) {
          r = false;
          bad_levels.push(s[k]);
        } else if (res[i].type === s[k].type && s[k].break === b && res[i].res >= parseInt(s[k].value)) {
          good_levels.push(s[k]);
        }
      }
    }
    return { status: r, bad: bad_levels, good: good_levels };
  };

  const getDescription = (type: string) => {
    const found = ttypes.find(tt => tt.type === type);
    return found ? t(found.trans) : '';
  };

  const addResultItem = (t: any, resultsArr: any[]) => {
    // Check if we already have result for current test type then return
    if (resultsArr.some((r: any) => t.type === r.type)) return;
    // Exclude intro/results/cft types
    let approve = true;
    if (t.type === "intro" || t.type === "resultspcm" || t.type === "results" || t.type === "cft") approve = false;
    if (approve) resultsArr.push({ type: t.type, desc: t.description, presented: 0, wrong: 0, count: 0, details: [] });
  };

  const clearResults = () => setResults([]);

  // Get results instance array from data
  const getResultsInst = (data: any[]) => {
    let result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      addResultItem(c, result);
    }
    return result;
  };

  // Add a result item to the results state
  const addResult = (r: ResultItem) => {
    setResults(prev => [...prev, r]);
  };

  // Delete all results
  const deleteResults = () => setResults([]);

  // Get tests (returns array of card items, sets testFlow)
  const getTests = (data: any[]): React.ReactElement[] => {
    const out: React.ReactElement[] = [];
    const testFlowArr: TestFlowItem[] = [];
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const pos = parseInt(c.position);
      testFlowArr.push({ position: pos, type: c.type, level: parseInt(c.break) });
      const Comp = testStepComponentMap[c.type];
      if (typeof Comp === 'function') {
        out.push(React.createElement(Comp, { ...c, key: c.id || `${c.type}-${pos}` }));
      }
    }
    setTestFlow(testFlowArr);
    return out;
  };


  // Get max reached level for each test type and lowest level
  const getLevelByResults = (res: any[]): any => {
    type LevelVal = typeof res[0] | null;
    let lvs: any[] = [];
    for (let i = 0; i < res.length; i++) {
      let r = res[i];
      let l: number | null = null;
      lvs.forEach((lv, index) => { if (lv.type === r.type) l = index; });
      if (l === null) {
        lvs.push(r);
        continue;
      } else {
        if (r.level > lvs[l].level) lvs[l] = r;
      }
    }
    let ll: LevelVal = null;
    let last_level = 100;
    let last_success = 100;
    for (let i = 0; i < lvs.length; i++) {
      if (lvs[i].level < last_level) {
        last_level = lvs[i].level;
        last_success = lvs[i].value;
        ll = lvs[i];
      } else if (lvs[i].level === last_level) {
        if (lvs[i].value < last_success) {
          last_level = lvs[i].level;
          last_success = lvs[i].value;
          ll = lvs[i];
        }
      }
    }
    if (ll) {
      let al: any[] = [];
      standart && standart.forEach((l: any) => { if (parseInt(l.break) === ll.level && l.test_type === ll.type) al.push(l); });
      if (al.length === 1) return al[0];
      else {
        let ldl: any = null;
        let ilv: any[] = [];
        al.forEach((a: any) => {
          if (a.value > ll.average) ilv.push(a);
        });
        if (ilv.length === 0) return standart[standart.length - 1];
        ilv.forEach((a: any) => {
          if (!ldl || ldl.value < a.value) ldl = a;
        });
        return ldl;
      }
    } else {
      return standart ? standart[0] : null;
    }
  };

  // Combine results across levels/types
  const combineResults = (): any[] => {
    let r: any[] = [];
    for (let i = 0; i < results.length; i++) {
      let level = results[i].level;
      let type = results[i].type;
      let inst = results[i].inst;
      let description = results[i].description;
      let le: any = null;
      for (let k = 0; k < r.length; k++) {
        if (r[k].level === level && r[k].type === type) { le = r[k]; break; }
      }
      if (!le) {
        le = { level, type, inst, success: [] as number[], average: 0, description, presented: 0, wrong: 0, details: [], treshold: 0 };
        r.push(le);
      }
      le.success.push(results[i].getSuccess ? results[i].getSuccess() : 0);
      le.presented += results[i].presented;
      le.wrong += results[i].wrong;
      le.details = le.details.concat(results[i].details || []);
      le.treshold = results[i].treshold || 0;
    }
    for (let k = 0; k < r.length; k++) {
      let s = r[k].success;
      let sum = 0;
      for (let i = 0; i < s.length; i++) { sum += s[i]; }
      let clear_success = Math.round(sum / (s.length || 1));
      let st = clear_success - r[k].treshold;
      let rs = 0;
      if (st > 0) rs = Math.round((st / (100 - r[k].treshold)) * 100);
      r[k].average = rs;
    }
    return r;
  };

  // Get next test position based on results and flow
  const getNextPosition = (cpos: number): number => {
    let r = combineResults();
    const ficp = testFlow.find(i => i.position === cpos);
    const al = getAssessmentLevel(ficp);
    const ri = r.find(res => ficp && res.level === ficp.level && res.type === ficp.type);
    if (!ri || !al) return cpos + 1;
    if (ri.average >= al.value) return cpos + 1;
    let finp: TestFlowItem | undefined = undefined;
    let pa = 1;
    do {
      finp = testFlow.find(i => i.position === cpos + pa);
      pa++;
    } while (finp && ficp && finp.level > ficp.level && finp.type === ficp.type);
    return finp ? finp.position : cpos + 1;
  };

  // Get current break index for a position
  const getCurrentBreak = (current_position: number): number => {
    let b = 0;
    for (let k = 0; k < testBreakPositions.length; k++) {
      const t = testBreakPositions[k];
      if (current_position >= t.start && current_position <= t.end) {
        b = k;
        break;
      }
    }
    return b;
  };

  // Get assessment level for a flow item
  const getAssessmentLevel = (i: TestFlowItem | undefined): any => {
    if (!i || !standart) return null;
    let al: any = null;
    standart.forEach((l: any) => {
      if (parseInt(l.break) === i.level && l.test_type === i.type) al = l;
    });
    return al;
  };

  return {
    ttypes,
    breaks,
    standart,
    assesmentLoaded,
    testFlow,
    results,
    testBreakPositions,
    endPosition,
    minResItems,
    getLevels,
    addTestBreakPosition,
    getResultStatusForBreak,
    getDescription,
    addResultItem,
    getResultsInst,
    addResult,
    deleteResults,
    getTests,
    getLevelByResults,
    combineResults,
    getNextPosition,
    getCurrentBreak,
    getAssessmentLevel,
    clearResults,
    setResults,
    setTestFlow,
    setEndPosition,
    setStandart,
    setTestBreakPositions,
  };
}
