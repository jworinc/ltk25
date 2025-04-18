import React, { useState } from 'react';
import { useDisplayResults } from './useDisplayResults';

export default function UseDisplayResultsHarness() {
  const dr = useDisplayResults();
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <h2>useDisplayResults Harness</h2>
      <div>
        <label>
          Right:
          <input type="number" value={right} onChange={e => setRight(Number(e.target.value))} style={{ marginLeft: 8 }} />
        </label>
        <label style={{ marginLeft: 16 }}>
          Wrong:
          <input type="number" value={wrong} onChange={e => setWrong(Number(e.target.value))} style={{ marginLeft: 8 }} />
        </label>
        <button onClick={() => dr.setResult(right, wrong)} style={{ marginLeft: 16 }}>
          Set Result
        </button>
        <button onClick={dr.clear} style={{ marginLeft: 8 }}>
          Clear
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Right:</strong> {dr.right} <strong>Wrong:</strong> {dr.wrong}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Praise:</strong> {dr.praise}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Is Empty:</strong> {dr.isEmpty() ? 'Yes' : 'No'}
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Good Score Praising:</strong>
        <pre style={{ background: '#f7f7f7', padding: 8 }}>{JSON.stringify(dr.goodScorePraising, null, 2)}</pre>
        <strong>Bad Score Praising:</strong>
        <pre style={{ background: '#f7f7f7', padding: 8 }}>{JSON.stringify(dr.badScorePraising, null, 2)}</pre>
      </div>
    </div>
  );
}
