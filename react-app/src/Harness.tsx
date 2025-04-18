import React, { useState, useEffect } from 'react';
import { useAuth } from './services/useAuth';
import TabbedHarness from './TabbedHarness';
import { useTestBuilder } from './services/useTestBuilder';
import { useDataloader } from './services/useDataloader';
import config from './harness-config.json';
import { useFontAdjuster } from './services/useFontAdjuster';
import { usePlaySentence } from './services/usePlaySentence';
import { usePlayWords } from './services/usePlayWords';
import { WordTranslate } from './services/WordTranslate';
import { CardAnchor } from './services/CardAnchor';
import { TestAnchor } from './services/TestAnchor';

const TEST_EMAIL = 'test1@test.ts';
const TEST_PASSWORD = 'test123';

// Top-level API explorer component
const TopLevelApiExplorer: React.FC = () => {
  const dl = useDataloader();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any[]>([]);

  // List of endpoints to call
  const apis = [
    { name: 'getLessons', fn: () => dl.getLessons() },
    { name: 'getCards', fn: () => dl.getCards(1) }, // use lesson 1 as example
    { name: 'getOptions', fn: () => dl.getOptions() },
    { name: 'getStudentInfo', fn: () => dl.getStudentInfo() },
    { name: 'getStudentLessons', fn: () => dl.getStudentLessons() },
    { name: 'getProgress', fn: () => dl.getProgress() },
    { name: 'getSummary', fn: () => dl.getSummary() },
    { name: 'getPlacement', fn: () => dl.getPlacement() },
    { name: 'getSightWords', fn: () => dl.getSightWords() },
    { name: 'getNotebookWords', fn: () => dl.getNotebookWords() },
    { name: 'getGrammarTopics', fn: () => dl.getGrammarTopics() },
    { name: 'getHelpConfiguration', fn: () => dl.getHelpConfiguration() },
    { name: 'activities', fn: () => dl.activities() },
  ];

  useEffect(() => {
    setLoading(true);
    setResults({});
    setSummary([]);
    const fetchAll = async () => {
      const newResults: any = {};
      const newSummary: any[] = [];
      for (const api of apis) {
        try {
          // eslint-disable-next-line no-console
          console.log(`[TopLevelApiExplorer] Calling ${api.name}`);
          const data = await api.fn();
          newResults[api.name] = { status: 'success', data };
          newSummary.push({ name: api.name, status: 'success' });
          // eslint-disable-next-line no-console
          console.log(`[TopLevelApiExplorer] ${api.name} success`, data);
        } catch (err: any) {
          newResults[api.name] = { status: 'error', error: err?.message || String(err) };
          newSummary.push({ name: api.name, status: 'error', error: err?.message || String(err) });
          // eslint-disable-next-line no-console
          console.error(`[TopLevelApiExplorer] ${api.name} error`, err);
        }
      }
      setResults(newResults);
      setSummary(newSummary);
      setLoading(false);
    };
    fetchAll();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {loading && <div>Loading top-level entities...</div>}
      {!loading && (
        <>
          <table className="w-full text-sm mb-2">
            <thead>
              <tr>
                <th className="text-left">Endpoint</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s, idx) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td style={{ color: s.status === 'success' ? 'limegreen' : 'crimson' }}>{s.status}</td>
                  <td style={{ color: 'red' }}>{s.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <details>
            <summary>Full API Results & Logs</summary>
            <pre style={{ maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(results, null, 2)}</pre>
          </details>
        </>
      )}
    </div>
  );
};

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

  // --- BEGIN: Config-driven API-powered Harness Section ---
  const testBuilder = useTestBuilder();
  const dl = useDataloader();
  const [api, setApi] = useState(config.defaultApi);
  const [lessonId, setLessonId] = useState(config.defaultLessonId);
  const [testData, setTestData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  // Fetch test data from selected API
  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    setApiError(null);
    let promise;
    if (api === 'getTest') promise = dl.getTest();
    else if (api === 'getCards') promise = dl.getCards(lessonId);
    else if (api === 'getTypedTest') promise = dl.getTypedTest('aud');
    else promise = Promise.resolve([]);
    promise
      .then(data => {
        setTestData(data);
        setLoading(false);
        setCurrentStep(0);
        setAnswers([]);
      })
      .catch(e => {
        setApiError(e.message || 'Failed to load test data');
        setLoading(false);
      });
  }, [api, lessonId, dl, loggedIn]);

  const steps = testData ? testBuilder.getTests(testData) : [];

  const handleAnswer = (answer: any) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentStep] = answer;
    setAnswers(updatedAnswers);
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const goToStep = (idx: number) => setCurrentStep(idx);
  const handleRestart = () => {
    setAnswers([]);
    setCurrentStep(0);
  };
  const currentStepElement =
    steps.length > 0
      ? React.cloneElement(steps[currentStep], {
          onAnswer: handleAnswer,
          ...(answers[currentStep] !== undefined ? { userAnswer: answers[currentStep] } : {}),
        })
      : null;

  // Example usage of new hooks
  const fontContent = "This font will auto-adjust!";
  const fontRef = useFontAdjuster(0, [fontContent]);

  const sentence = "The quick brown fox jumps over the lazy dog.";
  const { ref: sentenceRef, handleClick: handleSentenceClick } = usePlaySentence(sentence, (w, i) => `/audio/${w}.mp3`);

  const words = ["alpha", "beta", "gamma"];
  const { playWords } = usePlayWords(words, (w, i) => `/audio/${w}.mp3`);

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

      {/* BEGIN TOP-LEVEL ENTITY FETCH/LOGGING */}
      {loggedIn && (
        <div className="mt-6 p-4 border rounded bg-gray-800/30">
          <h2 className="font-semibold mb-2">Top-Level Entity API Calls</h2>
          <TopLevelApiExplorer />
        </div>
      )}
      {/* END TOP-LEVEL ENTITY FETCH/LOGGING */}

      {/* BEGIN API-DRIVEN HARNESS UI */}
      {loggedIn && (
        <div className="mt-6 p-4 border rounded bg-gray-700/30">
          <h2 className="font-semibold mb-2">Test Builder Harness (Config-Driven, API-Powered)</h2>
          <div>
            <h3>Play Words Demo</h3>
            <div>
              {words.join(' ')}
              <button style={{ marginLeft: 8 }} onClick={playWords}>Play Words</button>
            </div>
          </div>
          <div>
            <h3>Word Translate Demo</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {['cat', 'dog', 'apple'].map(word => (
                <WordTranslate
                  key={word}
                  word={word}
                  getTranslation={async w => `Translation of ${w}`}
                  iconPosition="right"
                  iconHide={false}
                />
              ))}
            </div>
          </div>
          <div>
            <h3>Card Anchor Demo</h3>
            <CardAnchor>
              <div style={{ border: '1px solid #aaa', padding: 12, borderRadius: 6, background: '#f9f9f9' }}>
                <strong>Dynamic Card Content</strong>
                <div>This content is rendered inside CardAnchor.</div>
              </div>
            </CardAnchor>
          </div>
          <div>
            <h3>Test Anchor Demo</h3>
            <TestAnchor>
              <div style={{ border: '1px solid #0af', padding: 12, borderRadius: 6, background: '#eef7ff' }}>
                <strong>Dynamic Test-Step Content</strong>
                <div>This content is rendered inside TestAnchor.</div>
              </div>
            </TestAnchor>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              API:
              <select value={api} onChange={e => setApi(e.target.value)} style={{ marginLeft: 8 }}>
                {config.apiOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            {api === 'getCards' && (
              <input
                type="number"
                value={lessonId}
                min={1}
                onChange={e => setLessonId(Number(e.target.value))}
                style={{ marginLeft: 8, width: 80 }}
                placeholder="Lesson ID"
              />
            )}
          </div>
          {loading && <div>Loading test data...</div>}
          {apiError && <div style={{ color: 'red' }}>Error: {apiError}</div>}
          {!loading && !apiError && steps.length > 0 && (
            <>
              <strong>Step {currentStep + 1} of {steps.length}</strong>
              <div style={{ margin: '24px 0' }}>{currentStepElement}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => goToStep(currentStep - 1)} disabled={currentStep === 0}>Previous</button>
                <button onClick={() => goToStep(currentStep + 1)} disabled={currentStep >= steps.length - 1}>Next</button>
                <button onClick={handleRestart}>Restart</button>
              </div>
            </>
          )}
          <hr />
          {config.ui.showDebug && (
            <details style={{ marginTop: 16 }}>
              <summary>Debug Info</summary>
              <pre>{JSON.stringify({ answers, currentStep, testData, api, lessonId }, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
      {/* END API-DRIVEN HARNESS UI */}

      {/* BEGIN TABBED HARNESS UI */}
      <TabbedHarness />
    </div>
  );
};

export default Harness;

