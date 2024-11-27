import React, { useState } from 'react';
import FieldSelection from './FieldSelectionComponent';

interface ContextMenuProps {
  position: { x: number; y: number };
  onSelect: (action: string, append?: boolean, fieldPath?: string) => void;
  isOpen: boolean;
  objects: Array<{ value: string; label: string }>;
  getFields: (objectName: string) => Promise<any[]>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  position, 
  onSelect, 
  isOpen,
  objects,
  getFields
}) => {
  const [activeTab, setActiveTab] = useState('salesforce');

  if (!isOpen) return null;

  const tabs = [
    { id: 'salesforce', label: 'Salesforce Fields' },
    { id: 'condition', label: 'IF Condition' },
    { id: 'loop', label: 'FOR Loop' },
  ];

  const handleFieldSelect = (fieldPath: string, append: boolean) => {
    onSelect('salesforce', append, fieldPath);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 8px)',
        minWidth: '300px',
      }}
      onClick={handleClick}
    >
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-2">
        {activeTab === 'salesforce' && (
          <FieldSelection 
            onFieldSelect={handleFieldSelect}
            objects={objects}
            getFields={getFields}
            className="p-2"
          />
        )}
        
        {activeTab === 'condition' && (
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => onSelect('condition')}
          >
            Add IF Condition
          </button>
        )}
        
        {activeTab === 'loop' && (
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => onSelect('loop')}
          >
            Add FOR Loop
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextMenu; 