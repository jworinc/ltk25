// ErrorLogService equivalent for React
import axios from 'axios';
import { useToken } from './useToken';

const BASE_URL = 'https://api.ltk.cards/api';

export function useErrorLog() {
  const token = useToken();
  async function log(data: any) {
    const headers = { 'Content-Type': 'application/json', ...token.getAuthHeader() };
    return axios.post(`${BASE_URL}/error/log`, data, { headers });
  }
  return { log };
}
