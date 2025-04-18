import React from 'react';

// Replace these with your real implementations
export const AuditoryTestComponent: React.FC<any> = ({ question, options, onAnswer, ...rest }) => (
  <div style={{ border: '2px solid #1976d2', borderRadius: 8, padding: 16, margin: 8 }}>
    <h3>Auditory Test</h3>
    {question && <div><strong>Question:</strong> {question}</div>}
    {options && Array.isArray(options) && (
      <ul>
        {options.map((opt: string, idx: number) => (
          <li key={idx}>
            <button onClick={() => onAnswer && onAnswer(opt)}>{opt}</button>
          </li>
        ))}
      </ul>
    )}
    <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
  </div>
);
export const ComprehensionTestComponent: React.FC<any> = ({ passage, question, options, onAnswer, ...rest }) => (
  <div style={{ border: '2px solid #388e3c', borderRadius: 8, padding: 16, margin: 8 }}>
    <h3>Comprehension Test</h3>
    {passage && <blockquote style={{ fontStyle: 'italic', background: '#f1f8e9', padding: 8 }}>{passage}</blockquote>}
    {question && <div><strong>Question:</strong> {question}</div>}
    {options && Array.isArray(options) && (
      <ul>
        {options.map((opt: string, idx: number) => (
          <li key={idx}>
            <button onClick={() => onAnswer && onAnswer(opt)}>{opt}</button>
          </li>
        ))}
      </ul>
    )}
    <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
  </div>
);
export const SpellingTestComponent: React.FC<any> = ({ word, onAnswer, ...rest }) => {
  const [input, setInput] = React.useState('');
  return (
    <div style={{ border: '2px solid #fbc02d', borderRadius: 8, padding: 16, margin: 8 }}>
      <h3>Spelling Test</h3>
      {word && <div><strong>Spell this word:</strong> {word}</div>}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your spelling"
        style={{ margin: '8px 0', padding: 4 }}
      />
      <button onClick={() => onAnswer && onAnswer(input)} disabled={!input}>Submit</button>
      <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
    </div>
  );
};
export const IntroComponent: React.FC<any> = ({ title, description, ...rest }) => (
  <div style={{ border: '2px solid #0288d1', borderRadius: 8, padding: 16, margin: 8, background: '#e1f5fe' }}>
    <h2>{title || 'Welcome to the Assessment!'}</h2>
    <p>{description || 'Follow the instructions to complete your tests.'}</p>
    <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
  </div>
);
export const ResultsComponent: React.FC<any> = ({ results, ...rest }) => (
  <div style={{ border: '2px solid #7b1fa2', borderRadius: 8, padding: 16, margin: 8, background: '#f3e5f5' }}>
    <h3>Results</h3>
    {results ? (
      <ul>
        {Array.isArray(results) ? results.map((r, idx) => <li key={idx}>{JSON.stringify(r)}</li>) : JSON.stringify(results)}
      </ul>
    ) : <span>No results yet.</span>}
    <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
  </div>
);
export const ResultspcmComponent: React.FC<any> = ({ pcmResults, ...rest }) => (
  <div style={{ border: '2px solid #c62828', borderRadius: 8, padding: 16, margin: 8, background: '#ffebee' }}>
    <h3>PCM Results</h3>
    {pcmResults ? (
      <ul>
        {Array.isArray(pcmResults) ? pcmResults.map((r, idx) => <li key={idx}>{JSON.stringify(r)}</li>) : JSON.stringify(pcmResults)}
      </ul>
    ) : <span>No PCM results yet.</span>}
    <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
  </div>
);
export const CftComponent: React.FC<any> = ({ cftData, ...rest }) => (
  <div style={{ border: '2px solid #00897b', borderRadius: 8, padding: 16, margin: 8, background: '#e0f2f1' }}>
    <h3>CFT</h3>
    {cftData ? <pre>{JSON.stringify(cftData, null, 2)}</pre> : <span>No CFT data.</span>}
    <pre style={{ fontSize: 12, color: '#555' }}>{JSON.stringify(rest, null, 2)}</pre>
  </div>
);

export const testStepComponentMap: Record<string, React.ComponentType<any>> = {
  aud: AuditoryTestComponent,
  cmp: ComprehensionTestComponent,
  spl: SpellingTestComponent,
  intro: IntroComponent,
  results: ResultsComponent,
  resultspcm: ResultspcmComponent,
  cft: CftComponent,
};
