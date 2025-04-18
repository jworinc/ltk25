// Robust TokenService equivalent for React migration
// Provides token storage, retrieval, validation, user info, and auth header logic

const TOKEN_KEY = 'token';
const EMAIL_KEY = 'email';
const NAME_KEY = 'name';
const PROF_KEY = 'prof';
const CODE_KEY = 'pcmcode';
const TYPE_KEY = 'testtype';

const ISS = [
  'https://api.ltk.cards/api/login',
  'https://api.ltk.cards/api/rel/login',
  'https://api.ltk.cards/api/signup',
  'https://api.ltk.cards/api/entrance',
  'https://api.ltk.cards/api/logincode',
  'https://api.ltk.cards/api/come',
];

function lsTest() {
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.log('Access to localStorage disabled!');
    return false;
  }
}

function setToken(token: string) {
  if (lsTest()) localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  if (lsTest()) return localStorage.getItem(TOKEN_KEY);
  return '';
}

function removeToken() {
  if (lsTest()) localStorage.removeItem(TOKEN_KEY);
}

function setEmail(email: string, name: string = '') {
  if (lsTest()) localStorage.setItem(EMAIL_KEY, email);
  if (name && lsTest()) localStorage.setItem(NAME_KEY, name);
}

function getEmail() {
  if (lsTest()) return localStorage.getItem(EMAIL_KEY) || '';
  return '';
}

function getName() {
  if (lsTest()) return localStorage.getItem(NAME_KEY) || '';
  return '';
}

function setProf(prof: string) {
  if (lsTest()) localStorage.setItem(PROF_KEY, prof);
}

function getProf() {
  if (lsTest()) return localStorage.getItem(PROF_KEY) || '';
  return '';
}

function setCode(code: string) {
  if (lsTest()) localStorage.setItem(CODE_KEY, code);
}

function getCode() {
  if (lsTest()) return localStorage.getItem(CODE_KEY) || '';
  return '';
}

function setType(type: string) {
  if (lsTest()) localStorage.setItem(TYPE_KEY, type);
}

function getType() {
  if (lsTest()) return localStorage.getItem(TYPE_KEY) || '';
  return '';
}

function clearUserTestingInfo() {
  if (lsTest()) {
    localStorage.removeItem(PROF_KEY);
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(TYPE_KEY);
  }
}

function getAuthHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function decodePayload(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isValidToken() {
  const token = getToken();
  if (token) {
    const payload = decodePayload(token);
    if (payload) {
      let iss_valid = ISS.includes(payload.iss);
      let current_time = Date.now() / 1000;
      let exp_valid = current_time < payload.exp;
      return iss_valid && exp_valid;
    }
  }
  return false;
}

function loggedIn() {
  return isValidToken();
}

export function useToken() {
  // Hook API for React components
  return {
    setToken,
    getToken,
    removeToken,
    setEmail,
    getEmail,
    getName,
    setProf,
    getProf,
    setCode,
    getCode,
    setType,
    getType,
    clearUserTestingInfo,
    getAuthHeader,
    decodePayload,
    isValidToken,
    loggedIn,
  };
}
