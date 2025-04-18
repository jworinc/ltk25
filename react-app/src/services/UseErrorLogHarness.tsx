import React, { useState } from 'react';
import { useErrorLog } from './useErrorLog';
import { useAuth } from './useAuth';

export default function UseErrorLogHarness() {
  const { loggedIn } = useAuth();
  const { log } = useErrorLog();
  const [output, setOutput] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!loggedIn) return <div>Please log in to test error logging.</div>;

  const handleLogError = async () => {
    try {
      const res = await log({ message: 'Test error log', time: new Date().toISOString() });
      setOutput(res.data || res);
      setErrorMsg('');
    } catch (e) {
      setErrorMsg(e.toString());
      setOutput(null);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <h2>useErrorLog Harness</h2>
      <button onClick={handleLogError}>Send Test Error Log</button>
      {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
      <pre style={{ background: '#f7f7f7', padding: 8, marginTop: 12 }}>
        {output ? JSON.stringify(output, null, 2) : 'No output yet.'}
      </pre>
    </div>
  );
}
