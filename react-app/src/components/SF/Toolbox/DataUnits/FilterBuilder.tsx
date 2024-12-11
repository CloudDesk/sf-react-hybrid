import React, { useState } from 'react';
import { FilterCondition } from './types';
import { OPERATORS, FilterOperator } from '../../../../constants/filterOperators';
import { AdvancedFieldSelection } from './AdvancedFieldSelection';
import { Field } from '../../../CKEditor/types';

interface PrimaryDataUnit {
  fields: string[];
  childUnits?: Array<{
    relationshipName: string;
    fields: string[];
  }>;
}

interface LookupPathItem {
  field: Field;
  fields: Field[];
}

interface FilterBuilderProps {
  conditions: FilterCondition[];
  fields: Field[];
  onConditionChange: (conditions: FilterCondition[]) => void;
  filterLogic: string;
  onFilterLogicChange: (logic: string) => void;
  primaryDataUnit?: PrimaryDataUnit;
  objectType: string;
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  fields,
  onConditionChange,
  filterLogic,
  onFilterLogicChange,
  primaryDataUnit,
  objectType,
}) => {
  const [showFieldSelector, setShowFieldSelector] = useState<number | null>(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [lookupPath, setLookupPath] = useState<LookupPathItem[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

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

  const handleFieldSelect = (field: Field, index: number) => {
    updateCondition(index, { field: field.value });
    setActiveFieldIndex(null);
    setLookupPath([]);
  };

  const handleLookupSelect = async (field: Field) => {
    if (!field.referenceTo) return;
    setIsLoadingFields(true);
    try {
      // In a real implementation, you would load the lookup fields here
      // For now, we'll just update the path
      setLookupPath(prev => [...prev, { field, fields }]);
    } catch (error) {
      console.error('Error loading lookup fields:', error);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleBack = () => {
    if (lookupPath.length > 0) {
      setLookupPath(prev => prev.slice(0, -1));
    }
  };

  const getPrimaryUnitFields = () => {
    if (!primaryDataUnit) return [];

    const mainFields = primaryDataUnit.fields.map((field: string) => ({
      label: field,
      value: `{!Primary.${field}}`,
      type: 'reference',
    }));

    const childFields = primaryDataUnit.childUnits?.flatMap((unit) => 
      unit.fields.map((field: string) => ({
        label: `${unit.relationshipName}.${field}`,
        value: `{!Primary.${unit.relationshipName}.${field}}`,
        type: 'reference',
      }))
    ) || [];

    return [...mainFields, ...childFields];
  };

  return (
    <div className="space-y-4">
      {/* Conditions List */}
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white rounded-lg border p-2">
            {/* Condition Number */}
            <span className="text-xs text-gray-500 px-2">
              {index + 1}
            </span>

            {/* Field Selection */}
            <div className="flex-1 min-w-[150px] relative">
              <div
                onClick={() => setActiveFieldIndex(index)}
                className={`px-2 py-1 text-sm border rounded cursor-pointer ${
                  activeFieldIndex === index ? 'border-blue-500 ring-1 ring-blue-500' : ''
                }`}
              >
                {condition.field || 'Select field'}
              </div>
              {activeFieldIndex === index && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50">
                  <div className="bg-white border rounded-lg shadow-lg">
                    <AdvancedFieldSelection
                      fields={fields}
                      selectedFields={[condition.field]}
                      onFieldSelect={(field) => handleFieldSelect(field, index)}
                      onLookupSelect={handleLookupSelect}
                      onBack={handleBack}
                      lookupPath={lookupPath}
                      isLoading={isLoadingFields}
                      isFieldSelected={(field) => condition.field === field.value}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Operator Select */}
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(index, { operator: e.target.value })}
              className="w-[100px] px-2 py-1 text-sm border rounded bg-white"
            >
              {OPERATORS.map((op: FilterOperator) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {/* Value Input with Reference Selection */}
            <div className="flex-1 min-w-[150px] relative flex space-x-1">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Enter value or select field"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
                {primaryDataUnit && (
                  <button
                    type="button"
                    onClick={() => setShowFieldSelector(showFieldSelector === index ? null : index)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 ${
                      showFieldSelector === index ? 'text-blue-500' : ''
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Field Reference Dropdown */}
                {showFieldSelector === index && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10">
                    <div className="bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      <div className="p-2 border-b">
                        <div className="text-xs font-medium text-gray-500">
                          Primary Data Unit Fields
                        </div>
                      </div>
                      <div className="py-1">
                        {getPrimaryUnitFields().map((field) => (
                          <div
                            key={field.value}
                            className="px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
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
                  </div>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeCondition(index)}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add Condition Button */}
      <button
        onClick={addCondition}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
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
            className="w-full px-3 py-2 text-sm border rounded-md"
          />
          <p className="text-xs text-gray-500">
            Use condition numbers (1, 2, etc.) with AND, OR, and parentheses
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterBuilder;