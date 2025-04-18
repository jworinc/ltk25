import React, { useState } from 'react';
import { useDataloader } from './useDataloader';

const TESTS = [
  { label: 'Load User Data', value: 'user' },
  { label: 'Load Lessons', value: 'lessons' },
  { label: 'Load Student Lessons', value: 'studentLessons' },
  { label: 'Set Starting Lesson', value: 'setStartingLesson' },
  { label: 'Get Cards for Lesson', value: 'getCards' },
  { label: 'Get Options', value: 'getOptions' },
  { label: 'Get Sight Words', value: 'getSightWords' },
  { label: 'Get Notebook Words', value: 'getNotebookWords' },
  { label: 'Get Grammar Topics', value: 'getGrammarTopics' },
  { label: 'Login Code', value: 'logincode' },
];

const DataloaderTestUI: React.FC = () => {
  const dl = useDataloader();
  const [test, setTest] = useState(TESTS[0].value);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lessonId, setLessonId] = useState(1);
  const [codeInput, setCodeInput] = useState('');

  const handleRunTest = async () => {
    setLoading(true);
    setOutput(null);
    try {
      let result;
      switch (test) {
        case 'user':
          result = await dl.getStudentInfo();
          break;
        case 'lessons':
          result = await dl.getLessons();
          break;
        case 'studentLessons':
          result = await dl.getStudentLessons();
          break;
        case 'setStartingLesson':
          result = await dl.setStartingLesson(lessonId);
          break;
        case 'getCards':
          result = await dl.getCards(lessonId);
          break;
        case 'getOptions':
          result = await dl.getOptions();
          break;
        case 'getSightWords':
          result = await dl.getSightWords();
          break;
        case 'getNotebookWords':
          result = await dl.getNotebookWords();
          break;
        case 'getGrammarTopics':
          result = await dl.getGrammarTopics();
          break;
        case 'logincode':
          result = await dl.logincode(codeInput);
          break;
        default:
          result = 'Unknown test';
      }
      setOutput(result);
    } catch (e: any) {
      setOutput(e.message || e.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8, maxWidth: 600 }}>
      <h2>Dataloader Test UI</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          Test Feature:&nbsp;
          <select value={test} onChange={e => setTest(e.target.value)}>
            {TESTS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        {(test === 'setStartingLesson' || test === 'getCards') && (
          <input
            type="number"
            min={1}
            value={lessonId}
            onChange={e => setLessonId(Number(e.target.value))}
            style={{ marginLeft: 8, width: 80 }}
            placeholder="Lesson ID"
          />
        )}
        {test === 'logincode' && (
          <input
            type="text"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            style={{ marginLeft: 8, width: 120 }}
            placeholder="Code"
          />
        )}
        <button
          style={{ marginLeft: 12, padding: '4px 12px' }}
          onClick={handleRunTest}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Run'}
        </button>
      </div>
      <div>
        <strong>Output:</strong>
        <pre style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4, minHeight: 60 }}>
          {output ? JSON.stringify(output, null, 2) : 'No output yet.'}
        </pre>
      </div>
    </div>
  );
};

export default DataloaderTestUI;
