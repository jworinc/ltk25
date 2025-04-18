import React, { useState } from 'react';
import { useLogging } from './useLogging';
import { useAuth } from './useAuth';

export default function UseLoggingHarness() {
  const { loggedIn } = useAuth();
  const logging = useLogging();
  const [output, setOutput] = useState<any>(null);
  const [lesson, setLesson] = useState<number>(1);
  const [instance, setInstance] = useState<string>('AL1');
  const [position, setPosition] = useState<number>(0);

  if (!loggedIn) return <div>Please log in to test logging.</div>;

  const handleLessonBegin = async () => {
    try {
      const res = await logging.lessonBegin(lesson);
      setOutput(res.data || res);
    } catch (e) {
      setOutput(e.toString());
    }
  };

  const handleLessonEnd = async () => {
    try {
      const res = await logging.lessonEnd(lesson);
      setOutput(res.data || res);
    } catch (e) {
      setOutput(e.toString());
    }
  };

  const handleCommandBegin = async () => {
    try {
      const res = await logging.commandBegin(instance, position, lesson);
      setOutput(res.data || res);
    } catch (e) {
      setOutput(e.toString());
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <h2>useLogging Harness</h2>
      <div>
        <label>
          Lesson ID:
          <input type="number" value={lesson} onChange={e => setLesson(Number(e.target.value))} />
        </label>
        <label style={{ marginLeft: 16 }}>
          Instance:
          <input value={instance} onChange={e => setInstance(e.target.value)} />
        </label>
        <label style={{ marginLeft: 16 }}>
          Position:
          <input type="number" value={position} onChange={e => setPosition(Number(e.target.value))} />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={handleLessonBegin}>Log Lesson Begin</button>
        <button onClick={handleLessonEnd} style={{ marginLeft: 8 }}>Log Lesson End</button>
        <button onClick={handleCommandBegin} style={{ marginLeft: 8 }}>Log Command Begin</button>
      </div>
      <pre style={{ background: '#f7f7f7', padding: 8, marginTop: 12 }}>
        {output ? JSON.stringify(output, null, 2) : 'No output yet.'}
      </pre>
    </div>
  );
}
