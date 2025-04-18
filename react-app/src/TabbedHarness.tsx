import React, { useState } from 'react';
import DataloaderTestUI from './services/DataloaderTestUI';
import UseOptionsHarness from './services/UseOptionsHarness';
import UseLoggingHarness from './services/UseLoggingHarness';
import UseErrorLogHarness from './services/UseErrorLogHarness';
import UseColorSchemeHarness from './services/UseColorSchemeHarness';
import UseHelpHarness from './services/UseHelpHarness';
import UseCustomFieldHarness from './services/UseCustomFieldHarness';
import UseDisplayResultsHarness from './services/UseDisplayResultsHarness';
import HarnessTestUI from './services/HarnessTestUI';

// Add more harnesses as needed
const harnessTabs = [
  { label: 'Dataloader', component: <DataloaderTestUI /> },
  { label: 'Options', component: <UseOptionsHarness /> },
  { label: 'Logging', component: <UseLoggingHarness /> },
  { label: 'ErrorLog', component: <UseErrorLogHarness /> },
  { label: 'ColorScheme', component: <UseColorSchemeHarness /> },
  { label: 'Help', component: <UseHelpHarness /> },
  { label: 'CustomField', component: <UseCustomFieldHarness /> },
  { label: 'DisplayResults', component: <UseDisplayResultsHarness /> },
  { label: 'Harness Tests', component: <HarnessTestUI /> },
];

const TabbedHarness: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="mt-8">
      <div className="flex space-x-2 border-b overflow-x-auto pb-1">
        {harnessTabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 whitespace-nowrap border-b-2 transition-colors duration-150 ${activeTab === idx ? 'border-blue-500 text-blue-500 font-bold' : 'border-transparent text-gray-400 hover:text-blue-400'}`}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 min-h-[200px]">
        {harnessTabs[activeTab].component}
      </div>
    </div>
  );
};

export default TabbedHarness;
