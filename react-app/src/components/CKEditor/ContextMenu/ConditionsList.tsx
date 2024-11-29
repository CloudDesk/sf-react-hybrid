import React, { useState } from 'react';
import { useTemplate } from '../../../contexts/TemplateContext';
import { SimpleCondition, ComplexCondition } from '../../../contexts/TemplateContext';

interface ConditionsListProps {
  onSelect: (reference: string) => void;
}

const ConditionsList: React.FC<ConditionsListProps> = ({ onSelect }) => {
  const { conditions } = useTemplate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatCondition = (condition: SimpleCondition | ComplexCondition): string => {
    if ('conditions' in condition) {
      // Complex condition
      return condition.conditions
        .map(formatSimpleCondition)
        .join(` ${condition.operator} `);
    }
    return formatSimpleCondition(condition);
  };

  const formatSimpleCondition = (condition: SimpleCondition): string => {
    const field1 = `${condition.field1.object}.${condition.field1.field}`;
    const field2 = 'value' in condition.field2 
      ? condition.field2.value
      : `${condition.field2.object}.${condition.field2.field}`;
    return `${field1} ${condition.operator} ${field2}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Saved Conditions</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {/* TODO: Add new condition */}}
        >
          New Condition
        </button>
      </div>
      
      <div className="space-y-2">
        {conditions.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            <div className="p-3 flex items-center justify-between bg-gray-50">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{entry.label}</h4>
                {entry.description && (
                  <p className="text-sm text-gray-600">{entry.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  {expandedId === entry.id ? '−' : '+'}
                </button>
                <button
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => onSelect(entry.reference)}
                >
                  Add
                </button>
              </div>
            </div>
            
            {expandedId === entry.id && (
              <div className="p-3 border-t bg-gray-50">
                <pre className="text-sm font-mono bg-white p-2 rounded border overflow-x-auto">
                  {formatCondition(entry.condition)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {conditions.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No conditions saved yet
        </div>
      )}
    </div>
  );
};

export default ConditionsList; 