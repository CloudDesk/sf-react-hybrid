import React from 'react';

interface TabsProps {
  activeTab: number;
  onTabChange: (tabId: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 0, label: 'Salesforce Fields' },
    { id: 1, label: 'IF Condition' },
    { id: 2, label: 'FOR Loop' },
  ];

  return (
    <nav className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === tab.id
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}; 