// DataloaderService equivalent for React
// Provides all API and data utility methods from the Angular service
import { useToken } from './useToken';

const BASE_URL = 'https://api.ltk.cards/api';

let lu = 10;
let card_descriptor = 'none';
let current_locale = 'en';
let logid = 0;

export function useDataloader() {
  const token = useToken();

  function getLocale() { return current_locale; }
  function setLocale(locale: string) { current_locale = locale; }
  function setLogId(id: number) { logid = id; }

  function setLastUncompleteLesson(data: any) {
    if (data && data.last_uncomplete) {
      lu = +data.last_uncomplete;
    }
  }

  async function login(data: any) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function come(data: any) {
    const res = await fetch(`${BASE_URL}/come`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function relatedLogin(data: any) {
    const res = await fetch(`${BASE_URL}/rel/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function entrance(link: string) {
    const res = await fetch(`${BASE_URL}/entrance/${link}`);
    return res.json();
  }

  async function logincode(code: string) {
    let cd = 'no';
    if (code && code !== '') cd = code;
    const res = await fetch(`${BASE_URL}/logincode/${cd}`);
    return res.json();
  }

  async function getLocales() {
    const res = await fetch(`${BASE_URL}/locales`);
    return res.json();
  }

  async function getStudentInfo() {
    const res = await fetch(`${BASE_URL}/u/studentinfo`, {
      headers: { ...token.getAuthHeader() },
    });
    const data = await res.json();
    setLastUncompleteLesson(data);
    return data;
  }

  async function getLessons() {
    const res = await fetch(`${BASE_URL}/u/lessons`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getCards(l: number) {
    const res = await fetch(`${BASE_URL}/u/cards/${l}`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getOptions() {
    const res = await fetch(`${BASE_URL}/options/get`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getSKUParams() {
    const res = await fetch(`${BASE_URL}/settings/sku/params`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function saveOptions(data: any) {
    const res = await fetch(`${BASE_URL}/options/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function saveFeedback(data: any) {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function activities() {
    const res = await fetch(`${BASE_URL}/activities`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function showme(l: number) {
    const res = await fetch(`${BASE_URL}/u/reports/showme/${l}`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getStudentLessons() {
    const res = await fetch(`${BASE_URL}/u/reports/get_student_lessons`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getProgress() {
    const res = await fetch(`${BASE_URL}/u/reports/progress`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getDetail() {
    const res = await fetch(`${BASE_URL}/u/reports/detail`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getSummary() {
    const res = await fetch(`${BASE_URL}/u/reports/summary`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getPlacement() {
    const res = await fetch(`${BASE_URL}/u/reports/placement`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function logMissingAudio(m: any) {
    const res = await fetch(`${BASE_URL}/log/missing/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(m),
    });
    return res.json();
  }

  async function getSightWords() {
    const res = await fetch(`${BASE_URL}/u/sightwords`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getNotebookWords() {
    const res = await fetch(`${BASE_URL}/u/notebookwords`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getGrammarTopics() {
    const res = await fetch(`${BASE_URL}/u/grammar/topics`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getGrammarContent(id: number) {
    const res = await fetch(`${BASE_URL}/u/grammar/content/${id}`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getTranslation(word: string, locale: string | null = null) {
    let loc = getLocale();
    if (locale) loc = locale;
    const res = await fetch(`${BASE_URL}/service/word/translation/${word}/${loc}`);
    return res.json();
  }

  async function getLastFeedbacks(descriptor: string) {
    if (descriptor) {
      let d = descriptor.replace('#', 'N');
      const res = await fetch(`${BASE_URL}/feedback/${d}`, {
        headers: { ...token.getAuthHeader() },
      });
      return res.json();
    } else {
      return null;
    }
  }

  async function sendCourseExpiredNotificationEmail() {
    const res = await fetch(`${BASE_URL}/notification/course/expired`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getTest() {
    const res = await fetch(`${BASE_URL}/testing/${lu}`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getPlacementTest() {
    const code = token.getCode();
    const email = token.getEmail();
    let url = code && code !== ''
      ? `${BASE_URL}/placement/${code}/${email}`
      : `${BASE_URL}/placement/${email}`;
    const res = await fetch(url, { headers: { ...token.getAuthHeader() } });
    return res.json();
  }

  async function getProfPlacement(prof: string) {
    const email = token.getEmail();
    const res = await fetch(`${BASE_URL}/placement/prof/${prof}/${email}`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getTypedTest(type: string) {
    const code = token.getCode();
    const email = token.getEmail();
    let url = code && code !== ''
      ? `${BASE_URL}/testing/typed/${code}/${type}/${email}`
      : `${BASE_URL}/testing/typed/${type}/${email}`;
    const res = await fetch(url, { headers: { ...token.getAuthHeader() } });
    return res.json();
  }

  async function getAssesmentLevels() {
    const code = token.getCode();
    if (token.loggedIn() && code && code !== '') {
      const res = await fetch(`${BASE_URL}/assesment/levels/${code}`, {
        headers: { ...token.getAuthHeader() },
      });
      return res.json();
    } else if (token.loggedIn() && (!code || code === '')) {
      const res = await fetch(`${BASE_URL}/assesment/levels`, {
        headers: { ...token.getAuthHeader() },
      });
      return res.json();
    } else {
      if (code && code !== '') {
        const res = await fetch(`${BASE_URL}/assesment/levels/${code}`);
        return res.json();
      } else {
        const res = await fetch(`${BASE_URL}/assesment/levels`);
        return res.json();
      }
    }
  }

  async function startTest(data: any) {
    const res = await fetch(`${BASE_URL}/placement/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function sendRegisterRequest(email: string, name: string = 'none') {
    const res = await fetch(`${BASE_URL}/placement/register/${logid}/${email}/${name}`);
    return res.json();
  }

  async function sendLinkExpiredNotificationEmail(link: string) {
    const res = await fetch(`${BASE_URL}/service/expired/${link}`);
    return res.json();
  }

  async function setStudentName(name: string) {
    const res = await fetch(`${BASE_URL}/student/set/name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify({ name }),
    });
    return res.json();
  }

  async function sendStudentFindTutorRequest(email: string) {
    const res = await fetch(`${BASE_URL}/student/send/findtutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify({ email }),
    });
    return res.json();
  }

  async function getHelpConfiguration() {
    const res = await fetch(`${BASE_URL}/config/help/menu`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function setStartingLesson(ln: number) {
    const res = await fetch(`${BASE_URL}/student/set/starting/${ln}`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  async function getTestingLog() {
    const res = await fetch(`${BASE_URL}/testing/log`, {
      headers: { ...token.getAuthHeader() },
    });
    return res.json();
  }

  return {
    getLocale,
    setLocale,
    setLogId,
    setLastUncompleteLesson,
    login,
    come,
    relatedLogin,
    entrance,
    logincode,
    getLocales,
    getStudentInfo,
    getLessons,
    getCards,
    getOptions,
    getSKUParams,
    saveOptions,
    saveFeedback,
    activities,
    showme,
    getStudentLessons,
    getProgress,
    getDetail,
    getSummary,
    getPlacement,
    logMissingAudio,
    getSightWords,
    getNotebookWords,
    getGrammarTopics,
    getGrammarContent,
    getTranslation,
    getLastFeedbacks,
    sendCourseExpiredNotificationEmail,
    getTest,
    getPlacementTest,
    getProfPlacement,
    getTypedTest,
    getAssesmentLevels,
    startTest,
    sendRegisterRequest,
    sendLinkExpiredNotificationEmail,
    setStudentName,
    sendStudentFindTutorRequest,
    getHelpConfiguration,
    setStartingLesson,
    getTestingLog,
  };
}
