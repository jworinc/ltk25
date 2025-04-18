import React, { useState, useEffect } from 'react';
import { useAuth } from './services/useAuth';
import * as dataloader from './services/dataloader';
import { harnessTests, getTestByName, HarnessTest, sampleCardData } from './harness-tests';
import { getCards as getCardbuilderCards } from './services/useCardbuilder.tsx';

const TEST_EMAIL = 'test1@test.ts';
const TEST_PASSWORD = 'test123';

const Harness: React.FC = () => {
  const { loggedIn, changeAuthStatus } = useAuth();
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [error, setError] = useState('');

  React.useEffect(() => {
    console.log(`[Harness] Auth status changed: loggedIn=${loggedIn}`);
  }, [loggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[Harness] Login attempt: email='${email}', password='${password}'`);
    try {
      const response = await fetch('https://api.ltk.cards/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      console.log('[Harness] API response received');
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await response.json();
      console.log('[Harness] API response parsed:', data);
      const token = data.access_token;
      localStorage.setItem('token', token);
      localStorage.setItem('ltk_token', token);
      localStorage.setItem('email', email);
      changeAuthStatus(true);
      setError('');
      console.log('[Harness] Login successful, token stored:', token);
    } catch (err) {
      setError('Invalid credentials');
      console.log('[Harness] Login failed:', err);
    }
  };

  const handleLogout = () => {
    console.log('[Harness] Logging out');
    changeAuthStatus(false);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    setError('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">React Migration Harness</h1>
      <p>Add your migrated components/services below to test them in isolation.</p>
      <div className="mt-6 p-4 border rounded bg-gray-900/40">
        <h2 className="font-semibold mb-2">AuthService Test</h2>
        <div>Status: <span style={{color: loggedIn ? 'limegreen' : 'crimson'}}>{loggedIn ? 'Logged In' : 'Logged Out'}</span></div>
        {!loggedIn ? (
          <form className="mt-2 flex flex-col gap-2" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-2 py-1 rounded border bg-gray-800 text-white"
              autoComplete="username"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-2 py-1 rounded border bg-gray-800 text-white"
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Log In
            </button>
            {error && <div className="text-red-400 mt-1">{error}</div>}
          </form>
        ) : (
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleLogout}
          >
            Log Out
          </button>
        )}
      </div>
      {/* DataloaderService Test Section */}
      <div className="mt-6 p-4 border rounded bg-gray-900/40">
        <h2 className="font-semibold mb-2">DataloaderService Test</h2>
        <DataloaderTestUI />
      </div>
      {/* Harness Test Section */}
      <div className="mt-6 p-4 border rounded bg-gray-900/40">
        <h2 className="font-semibold mb-2">Harness Tests</h2>
        <HarnessTestUI />
      </div>
    </div>
  );
};

const HarnessTestUI: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string>('');

  // Utility to get URL params
  function getParam(name: string): string | null {
    return new URLSearchParams(window.location.search).get(name);
  }

  // Run a single test
  async function runTest(test: HarnessTest) {
    setTestError('');
    setTestResult(null);
    console.log(`[HarnessTestUI] Running test: ${test.name}`);
    try {
      const result = await test.run();
      setTestResult(result);
      console.log(`[HarnessTestUI] Test result for ${test.name}:`, result);
    } catch (err: any) {
      setTestError(err.message || 'Test error');
      setTestResult(null);
      console.log(`[HarnessTestUI] Test error for ${test.name}:`, err);
    }
  }

  // Run all tests
  async function runAllTests() {
    setTestError('');
    setTestResult(null);
    console.log('[HarnessTestUI] Running all tests');
    const results: Record<string, any> = {};
    for (const test of harnessTests) {
      try {
        const result = await test.run();
        results[test.name] = result;
        console.log(`[HarnessTestUI] Test result for ${test.name}:`, result);
      } catch (err: any) {
        results[test.name] = { error: err.message || 'Test error' };
        console.log(`[HarnessTestUI] Test error for ${test.name}:`, err);
      }
    }
    setTestResult(results);
  }

  // Auto-run by URL param
  useEffect(() => {
    const testName = getParam('testname');
    const runAll = getParam('test') !== null;
    if (testName) {
      const test = getTestByName(testName);
      if (test) runTest(test);
    } else if (runAll) {
      runAllTests();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap items-center">
        <select
          className="px-2 py-1 rounded border bg-gray-800 text-white"
          value={selectedTest}
          onChange={e => setSelectedTest(e.target.value)}
        >
          <option value="">-- Select Test --</option>
          {harnessTests.map(t => (
            <option key={t.name} value={t.name}>{t.label}</option>
          ))}
        </select>
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={() => {
            const test = getTestByName(selectedTest);
            if (test) runTest(test);
          }}
          disabled={!selectedTest}
        >
          Run Test
        </button>
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={runAllTests}
        >
          Run All
        </button>
      </div>
      {testError && <div className="text-red-400">{testError}</div>}
      {testResult && (
        <pre className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
      )}
    </div>
  );
};

const DataloaderTestUI: React.FC = () => {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [lessons, setLessons] = useState<any>(null);
  const [cards, setCards] = useState<any>(null);
  const [options, setOptions] = useState<any>(null);
  const [lessonId, setLessonId] = useState('');
  const [error, setError] = useState('');
  const [cardbuilderResult, setCardbuilderResult] = useState<any>(null);

  const callApi = async (fn: () => Promise<any>, setter: (data: any) => void, label: string) => {
    setError('');
    try {
      console.log(`[DataloaderTestUI] Button pressed: ${label}`);
      const data = await fn();
      setter(data);
      console.log(`[DataloaderTestUI] Output for ${label}:`, data);
    } catch (err: any) {
      setError(err.message || 'API error');
      setter(null);
      console.log(`[DataloaderTestUI] Error for ${label}:`, err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 mr-2"
          onClick={() => callApi(dataloader.getStudentInfo, setStudentInfo, 'Fetch Student Info')}
        >
          Fetch Student Info
        </button>
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 mr-2"
          onClick={() => callApi(dataloader.getLessons, setLessons, 'Fetch Lessons')}
        >
          Fetch Lessons
        </button>
        <input
          type="number"
          placeholder="Lesson ID"
          value={lessonId}
          onChange={e => setLessonId(e.target.value)}
          className="px-2 py-1 rounded border bg-gray-800 text-white w-28"
        />
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 mr-2"
          onClick={() => lessonId && callApi(() => dataloader.getCards(Number(lessonId)), setCards, `Fetch Cards (lessonId=${lessonId})`)}
        >
          Fetch Cards
        </button>
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 mr-2"
          onClick={() => callApi(dataloader.getOptions, setOptions, 'Fetch Options')}
        >
          Fetch Options
        </button>
      <button
        className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 mr-2"
        onClick={async () => {
          setError('');
          setCardbuilderResult(null);
          try {
            const result = getCardbuilderCards(sampleCardData);
            setCardbuilderResult(result);
            console.log('[DataloaderTestUI] Cardbuilder result:', result);
          } catch (err: any) {
            setError(err.message || 'Cardbuilder error');
            setCardbuilderResult(null);
            console.log('[DataloaderTestUI] Cardbuilder error:', err);
          }
        }}
      >
        Test Cardbuilder
      </button>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      {studentInfo && <pre className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(studentInfo, null, 2)}</pre>}
      {lessons && <pre className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(lessons, null, 2)}</pre>}
      {cards && <pre className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(cards, null, 2)}</pre>}
      {options && <pre className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(options, null, 2)}</pre>}
      {cardbuilderResult && (
        <div className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">
          <div className="mb-1 font-semibold">Cardbuilder Output:</div>
          <pre>{JSON.stringify(cardbuilderResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Harness;
