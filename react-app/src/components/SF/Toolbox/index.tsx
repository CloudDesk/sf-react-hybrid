import React, { useState } from 'react';
import ModelsTab from './Models';

interface ToolboxProps {
  isVisible: boolean;
}

interface Tab {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const Toolbox: React.FC<ToolboxProps> = ({ isVisible }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs: Tab[] = [
    { 
      id: 0, 
      label: 'Models',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      id: 1, 
      label: 'Conditions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Toolbox</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 0 && (
          <div className="p-4">
            <ModelsTab />
          </div>
        )}
        {activeTab === 1 && (
          <div className="p-4">
            <div className="text-gray-500 text-center">
              Conditions feature coming soon...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbox; 