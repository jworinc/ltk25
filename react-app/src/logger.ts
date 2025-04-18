// logger.ts: Overrides console.log and console.error to also POST to the local log server
const originalLog = console.log;
const originalError = console.error;

function sendLog(level: 'log' | 'error', ...args: any[]) {
  try {
    fetch('http://localhost:4000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[${level}] "${args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')}"`,
        timestamp: new Date().toISOString(),
      })
    });
  } catch (e) { /* ignore */ }
}

console.log = (...args) => {
  sendLog('log', ...args);
  originalLog(...args);
};

console.error = (...args) => {
  sendLog('error', ...args);
  originalError(...args);
};
