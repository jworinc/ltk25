// LoggingService equivalent for React
// Provides lesson, command, and placement logging, and performance calculation
import { useRef } from 'react';
import axios from 'axios';
import { useToken } from './useToken';

const BASE_URL = 'https://api.ltk.cards/api';
const single_types = ['AL1', 'GSC', 'GWM', 'OR1', 'OR3', 'OR4', 'SYP', 'SET', 'SIW', 'CAR'];

export function useLogging() {
  const token = useToken();
  const currentLessonRef = useRef<number>(0);

  function setCurrentLesson(l: number) {
    currentLessonRef.current = l;
  }

  async function lessonBegin(l: number) {
    const headers = token.getAuthHeader();
    return axios.get(`${BASE_URL}/u/logging/lesson/begin/${l}`, { headers });
  }

  async function lessonEnd(l: number) {
    const headers = token.getAuthHeader();
    return axios.get(`${BASE_URL}/u/logging/lesson/end/${l}`, { headers });
  }

  async function lessonTimeon(l: number) {
    const headers = token.getAuthHeader();
    return axios.get(`${BASE_URL}/u/logging/lesson/timeon/${l}`, { headers });
  }

  async function commandBegin(instance: string, position: number, l?: number) {
    const headers = token.getAuthHeader();
    const data = {
      instance,
      position,
      lesson: typeof l === 'number' ? l : currentLessonRef.current,
    };
    return axios.post(`${BASE_URL}/u/logging/command/begin`, data, { headers });
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

  async function commandEnd(
    instance: string,
    position: number,
    errlog: any[],
    presented: number,
    l: number,
    complete: boolean
  ) {
    const headers = token.getAuthHeader();
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
    return axios.post(`${BASE_URL}/u/logging/command/end`, data, { headers });
  }

  async function testEnd(
    instance: string,
    position: number,
    errlog: any[],
    presented: number,
    l: number,
    complete: boolean
  ) {
    const headers = token.getAuthHeader();
    const data = {
      instance,
      position,
      log: errlog,
      lesson: l,
      complete,
    };
    return axios.post(`${BASE_URL}/u/logging/test/end`, data, { headers });
  }

  async function placementEnd(
    result: any,
    logid: number,
    level: number,
    brk: number,
    lsn: number
  ) {
    const email = token.getEmail();
    const data = { email, result, logid, level, break: brk, lesson: lsn };
    const headers = token.getAuthHeader();
    if (token.loggedIn()) {
      return axios.post(`${BASE_URL}/placement/end`, data, { headers });
    } else {
      return axios.post(`${BASE_URL}/placement/end`, data);
    }
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
