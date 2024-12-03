import React, { useState, useEffect } from 'react';
import { Field } from '../../../CKEditor/types';

interface FilterCondition {
  id: number;
  field: string;
  operator: string;
  value: string;
}

interface FilterBuilderProps {
  conditions: FilterCondition[];
  fields: Field[];
  onConditionChange: (conditions: FilterCondition[]) => void;
  filterLogic: string;
  onFilterLogicChange: (logic: string) => void;
}

const OPERATORS = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: 'LIKE', label: 'Contains' },
  { value: 'LIKE', label: 'Starts With', template: 'value%' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: 'IN', label: 'In' },
  { value: 'NOT IN', label: 'Not In' },
];

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  fields,
  onConditionChange,
  filterLogic,
  onFilterLogicChange,
}) => {
  const [validationError, setValidationError] = useState<string>('');

  const validateFilterLogic = (logic: string) => {
    try {
      if (!logic) return null;

      // Get all numbers used in the logic
      const usedNumbers = logic.match(/\d+/g)?.map(Number) || [];
      const maxConditionNumber = conditions.length;
      
      // Check if all numbers are valid
      const hasInvalidNumbers = usedNumbers.some(num => num > maxConditionNumber || num < 1);
      if (hasInvalidNumbers) {
        return 'Filter numbers must match condition numbers';
      }

      // Check for valid operators
      const operators = logic.replace(/[0-9()]/g, '').trim().split(' ').filter(Boolean);
      const hasInvalidOperators = operators.some(op => !['AND', 'OR'].includes(op));
      if (hasInvalidOperators) {
        return 'Only AND and OR operators are allowed';
      }

      // Check for balanced parentheses
      const openParens = (logic.match(/\(/g) || []).length;
      const closeParens = (logic.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        return 'Unmatched parentheses';
      }

      return null;
    } catch (error) {
      return 'Invalid filter logic format';
    }
  };

  const handleLogicChange = (newLogic: string) => {
    const error = validateFilterLogic(newLogic);
    setValidationError(error || '');
    onFilterLogicChange(newLogic);
  };

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now(),
      field: '',
      operator: '=',
      value: '',
    };
    const newConditions = [...conditions, newCondition];
    onConditionChange(newConditions);
    
    // Auto-update filter logic
    if (!filterLogic) {
      handleLogicChange('1');
    } else {
      handleLogicChange(`${filterLogic} AND ${newConditions.length}`);
    }
  };

  const removeCondition = (id: number, index: number) => {
    const newConditions = conditions.filter(c => c.id !== id);
    onConditionChange(newConditions);
    
    // Update filter logic to remove the deleted condition
    if (filterLogic) {
      const updatedLogic = filterLogic
        .replace(new RegExp(`${index + 1}`), '')
        .replace(/\s*(?:AND|OR)\s*(?:AND|OR)\s*/, ' $1 ')
        .replace(/^\s*(?:AND|OR)\s*|\s*(?:AND|OR)\s*$/, '')
        .trim();
      handleLogicChange(updatedLogic);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Logic Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Filter Logic
          <span className="ml-2 text-xs text-gray-500">
            (e.g., (1 AND 2) OR 3)
          </span>
        </label>
        <input
          type="text"
          value={filterLogic}
          onChange={(e) => handleLogicChange(e.target.value)}
          placeholder="Enter filter logic..."
          className={`w-full px-3 py-2 border rounded-md text-sm ${
            validationError ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>

      {/* Conditions List */}
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div
            key={condition.id}
            className="flex items-center space-x-2 p-2 bg-white border rounded-md"
          >
            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              {index + 1}
            </span>
            <select
              value={condition.field}
              onChange={(e) => onConditionChange(
                conditions.map(c => c.id === condition.id ? { ...c, field: e.target.value } : c)
              )}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Select field...</option>
              {fields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              value={condition.operator}
              onChange={(e) => onConditionChange(
                conditions.map(c => c.id === condition.id ? { ...c, operator: e.target.value } : c)
              )}
              className="w-40 px-3 py-2 border rounded-md text-sm"
            >
              {OPERATORS.map((op) => (
                <option key={op.value + op.label} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={condition.value}
              onChange={(e) => onConditionChange(
                conditions.map(c => c.id === condition.id ? { ...c, value: e.target.value } : c)
              )}
              placeholder="Enter value..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />

            <button
              onClick={() => removeCondition(condition.id, index)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addCondition}
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Condition
      </button>
    </div>
  );
};

export default FilterBuilder; 