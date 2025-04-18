import React, { useState } from 'react';
import { useColorScheme } from './useColorScheme';

export default function UseColorSchemeHarness() {
  const { currentSet, colorSchemes, getCardBgColor, setScheme } = useColorScheme();
  const [scheme, setSchemeInput] = useState(0);

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <h2>useColorScheme Harness</h2>
      <div>
        <label>
          Scheme Index:
          <input
            type="number"
            value={scheme}
            min={0}
            max={colorSchemes.length - 1}
            onChange={e => setSchemeInput(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
        </label>
        <button onClick={() => setScheme(scheme)} style={{ marginLeft: 8 }}>
          Set Scheme
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Current Scheme Index:</strong> {currentSet}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Current Card Color:</strong> <span style={{ background: getCardBgColor(), padding: '0 12px', borderRadius: 4 }}>{getCardBgColor()}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>All Schemes:</strong>
        <pre style={{ background: '#f7f7f7', padding: 8 }}>{JSON.stringify(colorSchemes, null, 2)}</pre>
      </div>
    </div>
  );
}
