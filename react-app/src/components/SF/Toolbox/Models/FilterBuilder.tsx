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
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
];

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  fields,
  onConditionChange,
  filterLogic,
  onFilterLogicChange,
}) => {
  const [logicError, setLogicError] = useState<string>('');

  // Validate filter logic when it changes
  useEffect(() => {
    try {
      // Basic validation of filter logic format
      const usedNumbers = filterLogic.match(/\d+/g)?.map(Number) || [];
      const maxConditionNumber = conditions.length;
      
      const isValid = usedNumbers.every(num => num <= maxConditionNumber);
      const hasValidOperators = filterLogic.replace(/\d+/g, '')
        .trim()
        .split(' ')
        .every(op => ['AND', 'OR', '(', ')'].includes(op));

      if (!isValid) {
        setLogicError('Filter numbers cannot exceed the number of conditions');
      } else if (!hasValidOperators) {
        setLogicError('Invalid operators. Use only AND, OR, (, )');
      } else {
        setLogicError('');
      }
    } catch (error) {
      setLogicError('Invalid filter logic format');
    }
  }, [filterLogic, conditions.length]);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now(),
      field: '',
      operator: 'equals',
      value: '',
    };
    onConditionChange([...conditions, newCondition]);
    
    // Auto-update filter logic for new condition
    if (!filterLogic) {
      onFilterLogicChange('1');
    } else {
      onFilterLogicChange(`${filterLogic} AND ${conditions.length + 1}`);
    }
  };

  const removeCondition = (id: number, index: number) => {
    onConditionChange(conditions.filter(c => c.id !== id));
    
    // Update filter logic to remove the deleted condition
    const newLogic = filterLogic.replace(new RegExp(`${index + 1}`), '').trim()
      .replace(/\s+/g, ' ')
      .replace(/AND\s+AND/g, 'AND')
      .replace(/OR\s+OR/g, 'OR')
      .replace(/^\s*(?:AND|OR)\s*|\s*(?:AND|OR)\s*$/g, '');
    onFilterLogicChange(newLogic);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-medium text-gray-700">Filter Logic</label>
        <div className="flex flex-col space-y-1">
          <input
            type="text"
            value={filterLogic}
            onChange={(e) => onFilterLogicChange(e.target.value)}
            placeholder="e.g., (1 AND 2) OR 3"
            className={`px-3 py-2 border rounded-md text-sm ${
              logicError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {logicError && (
            <span className="text-xs text-red-500">{logicError}</span>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              {index + 1}
            </div>
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
                <option key={op.value} value={op.value}>
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
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
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