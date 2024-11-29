import React, { useState } from 'react';
import { Field } from '../types';
import { useSalesforce } from '../../../contexts/SalesforceContext';

interface ConditionBuilderProps {
  selectedObject: string | null;
  objectFields: Field[];
  onConditionComplete: (condition: string) => void;
}

interface ConditionState {
  field: Field | null;
  operator: string;
  valueType: 'field' | 'absolute';
  compareField: Field | null;
  absoluteValue: string;
}

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  selectedObject,
  objectFields,
  onConditionComplete,
}) => {
  const [condition, setCondition] = useState<ConditionState>({
    field: null,
    operator: '==',
    valueType: 'absolute',
    compareField: null,
    absoluteValue: '',
  });

  const operators = [
    { value: '==', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater Than or Equal' },
    { value: '<=', label: 'Less Than or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: '!contains', label: 'Does Not Contain' },
  ];

  const handleComplete = () => {
    if (!condition.field) return;

    let conditionString = `{${selectedObject}.${condition.field.value}}`;
    conditionString += ` ${condition.operator} `;
    
    if (condition.valueType === 'field' && condition.compareField) {
      conditionString += `{${selectedObject}.${condition.compareField.value}}`;
    } else {
      // Add quotes for string values
      const needsQuotes = condition.field.type === 'string' || 
                         condition.field.type === 'date' || 
                         condition.field.type === 'datetime';
      conditionString += needsQuotes ? `"${condition.absoluteValue}"` : condition.absoluteValue;
    }

    onConditionComplete(conditionString);
  };

  return (
    <div className="space-y-4">
      {/* Field Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Field
        </label>
        <select
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={condition.field?.value || ''}
          onChange={(e) => {
            const field = objectFields.find(f => f.value === e.target.value);
            setCondition(prev => ({ ...prev, field }));
          }}
        >
          <option value="">Select a field...</option>
          {objectFields.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      {/* Operator Selection */}
      {condition.field && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Operator
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={condition.operator}
            onChange={(e) => setCondition(prev => ({ ...prev, operator: e.target.value }))}
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Value Type Selection */}
      {condition.field && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compare With
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={condition.valueType === 'absolute'}
                onChange={() => setCondition(prev => ({ ...prev, valueType: 'absolute' }))}
              />
              <span className="ml-2">Value</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={condition.valueType === 'field'}
                onChange={() => setCondition(prev => ({ ...prev, valueType: 'field' }))}
              />
              <span className="ml-2">Another Field</span>
            </label>
          </div>
        </div>
      )}

      {/* Value Input */}
      {condition.field && condition.valueType === 'absolute' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Value
          </label>
          <input
            type={condition.field.type === 'number' ? 'number' : 'text'}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={condition.absoluteValue}
            onChange={(e) => setCondition(prev => ({ ...prev, absoluteValue: e.target.value }))}
            placeholder={`Enter ${condition.field.type} value...`}
          />
        </div>
      )}

      {/* Compare Field Selection */}
      {condition.field && condition.valueType === 'field' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Comparison Field
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={condition.compareField?.value || ''}
            onChange={(e) => {
              const field = objectFields.find(f => f.value === e.target.value);
              setCondition(prev => ({ ...prev, compareField: field }));
            }}
          >
            <option value="">Select a field...</option>
            {objectFields
              .filter(f => f.type === condition.field?.type)
              .map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Preview and Add Button */}
      {condition.field && (
        (condition.valueType === 'absolute' && condition.absoluteValue) ||
        (condition.valueType === 'field' && condition.compareField)
      ) && (
        <div className="pt-4 border-t">
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm font-mono">
            {`IF ${condition.field.label} ${operators.find(op => op.value === condition.operator)?.label} `}
            {condition.valueType === 'field' 
              ? condition.compareField?.label
              : condition.absoluteValue}
          </div>
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleComplete}
          >
            Add Condition
          </button>
        </div>
      )}
    </div>
  );
};

export default ConditionBuilder; 