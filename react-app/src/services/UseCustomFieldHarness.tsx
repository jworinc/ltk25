import React, { useState } from 'react';
import { useCustomField } from './useCustomField';

export default function UseCustomFieldHarness() {
  const cf = useCustomField();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);

  const handleSetFields = () => {
    try {
      const fields = JSON.parse(input);
      cf.setFields(fields);
      setOutput({
        hasStartScreen: cf.hasStartScreen,
        hasStartLesson: cf.hasStartLesson,
        hasEndScreen: cf.hasEndScreen,
        hasEndLesson: cf.hasEndLesson,
        startLesson: cf.getStartLesson(),
        startScreen: cf.getStartScreen(),
        endScreen: cf.getEndScreen(),
        endLesson: cf.getEndLesson(),
      });
    } catch (e) {
      setOutput('Invalid JSON');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <h2>useCustomField Harness</h2>
      <textarea
        rows={4}
        style={{ width: '100%' }}
        placeholder='Paste fields JSON array here'
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={handleSetFields} style={{ marginTop: 8 }}>
        Set Fields & Show Info
      </button>
      <pre style={{ background: '#f7f7f7', padding: 8, marginTop: 12 }}>
        {output ? JSON.stringify(output, null, 2) : 'No output yet.'}
      </pre>
    </div>
  );
}
