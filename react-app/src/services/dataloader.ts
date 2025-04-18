// dataloader.ts - React version of DataloaderService
// Uses fetch API and localStorage for token management

const API_BASE_URL = 'https://api.ltk.cards/api';

function getAuthHeader() {
  // Prefer ltk_token, fallback to token
  const token = localStorage.getItem('ltk_token') || localStorage.getItem('token');
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Login failed');
  return await res.json();
}

export async function getStudentInfo() {
  const res = await fetch(`${API_BASE_URL}/u/studentinfo`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to get student info');
  return await res.json();
}

export async function getLessons() {
  const res = await fetch(`${API_BASE_URL}/u/lessons`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to get lessons');
  return await res.json();
}

export async function getCards(lessonId: number) {
  const res = await fetch(`${API_BASE_URL}/u/cards/${lessonId}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to get cards');
  return await res.json();
}

export async function getOptions() {
  const res = await fetch(`${API_BASE_URL}/options/get`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to get options');
  return await res.json();
}

// Add more methods as needed, following the above pattern.
