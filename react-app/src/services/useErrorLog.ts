// ErrorLogService equivalent for React
import { useToken } from './useToken';

const BASE_URL = 'https://api.ltk.cards/api';

export function useErrorLog() {
  const token = useToken();
  async function log(data: any) {
    const res = await fetch(`${BASE_URL}/error/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...token.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  }
  return { log };
}
