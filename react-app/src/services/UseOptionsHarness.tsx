import React, { useState } from 'react';
import { useOptions } from './useOptions';
import { useAuth } from './useAuth';

const UseOptionsHarness: React.FC = () => {
  const { loggedIn } = useAuth();
  const {
    langs,
    options,
    loading,
    currentLocale,
    currentLanguage,
    pauseOnInstruction,
    setLanguage,
    setLocale,
    updateOptions,
    enablePauseOnInstruction,
    disablePauseOnInstruction,
    breakTestEnabled,
    getBreakTest,
  } = useOptions();

  const [customLang, setCustomLang] = useState('');
  const [customLocale, setCustomLocale] = useState('');
  const [optField, setOptField] = useState('');
  const [optValue, setOptValue] = useState('');
  const [output, setOutput] = useState<any>(null);

  if (!loggedIn) return <div>Please log in to test options.</div>;
  if (loading) return <div>Loading options...</div>;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-semibold">useOptions Test Harness</h2>
      <div className="mb-1">Current Language: <b>{currentLanguage}</b> | Locale: <b>{currentLocale}</b></div>
      <div className="mb-1">Pause On Instruction: <b>{pauseOnInstruction ? 'Yes' : 'No'}</b></div>
      <div className="mb-1">Break Test Enabled: <b>{breakTestEnabled() ? 'Yes' : 'No'}</b></div>
      <div className="mb-1">Options: <pre className="inline">{JSON.stringify(options, null, 2)}</pre></div>
      <div className="mb-1">Languages: <pre className="inline">{JSON.stringify(langs, null, 2)}</pre></div>
      <div className="flex gap-2 flex-wrap mb-2">
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={enablePauseOnInstruction}
        >Enable Pause</button>
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={disablePauseOnInstruction}
        >Disable Pause</button>
        <input
          type="text"
          placeholder="Set Language (e.g. english)"
          value={customLang}
          onChange={e => setCustomLang(e.target.value)}
          className="px-2 py-1 rounded border bg-gray-800 text-white w-48"
        />
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={() => setLanguage(customLang)}
        >Set Language</button>
        <input
          type="text"
          placeholder="Set Locale (e.g. en)"
          value={customLocale}
          onChange={e => setCustomLocale(e.target.value)}
          className="px-2 py-1 rounded border bg-gray-800 text-white w-48"
        />
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={() => setLocale(customLocale)}
        >Set Locale</button>
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        <input
          type="text"
          placeholder="Option Field (e.g. volume)"
          value={optField}
          onChange={e => setOptField(e.target.value)}
          className="px-2 py-1 rounded border bg-gray-800 text-white w-48"
        />
        <input
          type="text"
          placeholder="Value (e.g. 10)"
          value={optValue}
          onChange={e => setOptValue(e.target.value)}
          className="px-2 py-1 rounded border bg-gray-800 text-white w-48"
        />
        <button
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={async () => {
            const newOpts = { ...options, [optField]: optValue };
            await updateOptions(newOpts);
            setOutput(`Option '${optField}' updated to '${optValue}'`);
          }}
        >Update Option</button>
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        <input
          type="number"
          placeholder="Break Number (e.g. 1)"
          onChange={e => {
            const b = parseInt(e.target.value, 10);
            setOutput(getBreakTest(b));
          }}
          className="px-2 py-1 rounded border bg-gray-800 text-white w-48"
        />
        {output && <pre className="bg-black/40 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(output, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default UseOptionsHarness;
