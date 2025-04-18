import React, { useState } from 'react';
import { useHelp } from './useHelp';

export default function UseHelpHarness() {
  const help = useHelp();
  const [output, setOutput] = useState<any>(null);

  const handleLoadConfig = async () => {
    await help.loadConfigItems();
    setOutput(help.helpMenuItems);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <h2>useHelp Harness</h2>
      <button onClick={handleLoadConfig}>Load Help Config Items</button>
      <pre style={{ background: '#f7f7f7', padding: 8, marginTop: 12 }}>
        {output ? JSON.stringify(output, null, 2) : 'No output yet.'}
      </pre>
    </div>
  );
}
