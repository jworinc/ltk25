// LoggingService equivalent for React
// Provides lesson, command, and placement logging, and performance calculation
import { useToken } from './useToken';

const BASE_URL = 'https://api.ltk.cards/api';
const single_types = ['AL1', 'GSC', 'GWM', 'OR1', 'OR3', 'OR4', 'SYP', 'SET', 'SIW', 'CAR'];

export function useLogging() {
  const token = useToken();
  let currentLesson = 0;

  function setCurrentLesson(l: number) {
    currentLesson = l;
  }

  async function lessonBegin(l: number) {
    const res = await fetch(`${BASE_URL}/u/logging/lesson/begin/${l}`,
      { headers: { ...token.getAuthHeader() } });
    return res.json();
  }

  async function lessonEnd(l: number) {
    const res = await fetch(`${BASE_URL}/u/logging/lesson/end/${l}`,
      { headers: { ...token.getAuthHeader() } });
    return res.json();
  }

  async function lessonTimeon(l: number) {
    const res = await fetch(`${BASE_URL}/u/logging/lesson/timeon/${l}`,
      { headers: { ...token.getAuthHeader() } });
    return res.json();
  }

  async function commandBegin(instance: string, position: number, l?: number) {
    const data = {
      instance,
      position,
      lesson: l ?? currentLesson,
    };
    const res = await fetch(`${BASE_URL}/u/logging/command/begin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  function perfCalc(inst: string, pres: number, err: number) {
    let perf = 0;
    if (single_types.indexOf(inst) >= 0) {
      perf = 1 - (err / (3 * pres));
    } else {
      perf = 1 - (err / (4 * pres));
    }
    if (perf < 0.1) perf = 0.1;
    return Math.round(perf * 100) / 100;
  }

  async function commandEnd(instance: string, position: number, errlog: any[], presented: number, l: number, complete: boolean) {
    const data = {
      instance,
      position,
      errors: errlog.length,
      presented,
      performance: perfCalc(instance, presented, errlog.length),
      log: errlog,
      lesson: l,
      complete,
    };
    const res = await fetch(`${BASE_URL}/u/logging/command/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function testEnd(instance: string, position: number, errlog: any[], presented: number, l: number, complete: boolean) {
    const data = {
      instance,
      position,
      log: errlog,
      lesson: l,
      complete,
    };
    const res = await fetch(`${BASE_URL}/u/logging/test/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function placementEnd(result: any, logid: number, level: number, brk: number, lsn: number) {
    const data = {
      email: token.getEmail(),
      result,
      logid,
      level,
      break: brk,
      lesson: lsn,
    };
    const headers = { 'Content-Type': 'application/json', ...token.getAuthHeader() };
    const res = await fetch(`${BASE_URL}/placement/end`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  }

  return {
    setCurrentLesson,
    lessonBegin,
    lessonEnd,
    lessonTimeon,
    commandBegin,
    commandEnd,
    perfCalc,
    testEnd,
    placementEnd,
  };
}
