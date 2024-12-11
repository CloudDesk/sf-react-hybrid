import React, { useState } from 'react';
import { Field } from '../../../CKEditor/types';
import { FilterCondition } from './types';
import { AdvancedFieldSelection } from './AdvancedFieldSelection';

interface FilterBuilderProps {
  conditions: FilterCondition[];
  fields: Field[];
  onConditionChange: (conditions: FilterCondition[]) => void;
  filterLogic: string;
  onFilterLogicChange: (logic: string) => void;
  primaryDataUnit?: {
    fields: string[];
    childUnits: Array<{
      relationshipName: string;
      fields: string[];
    }>;
  };
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

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  fields,
  onConditionChange,
  filterLogic,
  onFilterLogicChange,
  primaryDataUnit,
}) => {
  const [activeConditionId, setActiveConditionId] = useState<number | null>(null);
  const [showFieldSelector, setShowFieldSelector] = useState<number | null>(null);

  const addCondition = () => {
    onConditionChange([
      ...conditions,
      { field: '', operator: '=', value: '' }
    ]);
  };

  const removeCondition = (index: number) => {
    onConditionChange(conditions.filter((_, i) => i !== index));
    setShowFieldSelector(null);
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    onConditionChange(
      conditions.map((c, i) => i === index ? { ...c, ...updates } : c)
    );
  };

  const getPrimaryUnitFields = () => {
    if (!primaryDataUnit) return [];

    const mainFields = primaryDataUnit.fields.map(field => ({
      label: field,
      value: `{!Primary.${field}}`,
    }));

    const childFields = primaryDataUnit.childUnits.flatMap(unit => 
      unit.fields.map(field => ({
        label: `${unit.relationshipName}.${field}`,
        value: `{!Primary.${unit.relationshipName}.${field}}`,
      }))
    );

    return [...mainFields, ...childFields];
  };

  return (
    <div className="space-y-4">
      {conditions.map((condition, index) => (
        <div key={index} className="bg-white border rounded-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm text-gray-600">Condition {index + 1}</span>
            <button
              onClick={() => removeCondition(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-3">
            {/* Field Selection */}
            <div>
              <select
                value={condition.field}
                onChange={(e) => updateCondition(index, { field: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="">Select field</option>
                {fields.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Selection */}
            <div>
              <select
                value={condition.operator}
                onChange={(e) => updateCondition(index, { operator: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value + op.label} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value Input with Field Selection */}
            <div className="relative">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Enter value"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                {primaryDataUnit && (
                  <button
                    type="button"
                    onClick={() => setShowFieldSelector(showFieldSelector === index ? null : index)}
                    className={`px-3 py-2 border rounded-md ${
                      showFieldSelector === index 
                        ? 'bg-blue-50 border-blue-500 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Reference Field
                  </button>
                )}
              </div>

              {/* Field Selection Dropdown */}
              {showFieldSelector === index && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="py-1">
                    {getPrimaryUnitFields().map((field) => (
                      <div
                        key={field.value}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          updateCondition(index, { value: field.value });
                          setShowFieldSelector(null);
                        }}
                      >
                        <span className="text-gray-900">{field.label}</span>
                        <span className="text-xs text-gray-500">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add Condition Button */}
      <button
        onClick={addCondition}
        className="inline-flex items-center text-blue-600 hover:text-blue-700"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Condition
      </button>

      {/* Filter Logic */}
      {conditions.length > 1 && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Filter Logic
          </label>
          <input
            type="text"
            value={filterLogic}
            onChange={(e) => onFilterLogicChange(e.target.value)}
            placeholder="Example: (1 AND 2) OR 3"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500">
            Use condition numbers (1, 2, etc.) with AND, OR, and parentheses
          </p>
        </div>
      )}
    </div>
  );
};