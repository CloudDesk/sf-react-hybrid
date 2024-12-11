import React, { useState } from 'react';
import DataUnitsTab from './DataUnits';

interface ToolboxProps {
  isVisible: boolean;
  onDataUnitsChange: (dataUnits: Array<{
    name: string;
    developerName: string;
    fields: string[];
  }>) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ isVisible, onDataUnitsChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={`w-96 border-l bg-white transition-all duration-300 ${isVisible ? '' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="border-b">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 0
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(0)}
            >
              Data Units
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(1)}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 0 && (
            <DataUnitsTab onDataUnitsChange={onDataUnitsChange} />
          )}
          {activeTab === 1 && (
            <div>Settings content</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbox; 