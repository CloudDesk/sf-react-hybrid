import React, { useState, useEffect, useMemo } from 'react';
import { FilterCondition, DataUnit } from './types';
import { OPERATORS, FilterOperator } from '../../../../constants/filterOperators';
import { AdvancedFieldSelection } from './AdvancedFieldSelection';
import { Field } from '../../../CKEditor/types';

interface FilterBuilderProps {
  conditions: FilterCondition[];
  fields: Field[];
  onConditionChange: (conditions: FilterCondition[]) => void;
  filterLogic: string;
  onFilterLogicChange: (logic: string) => void;
  existingDataUnits?: DataUnit[];
  currentDataUnit?: string;
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  fields,
  onConditionChange,
  filterLogic,
  onFilterLogicChange,
  existingDataUnits = [],
  currentDataUnit,
}) => {
  const [showFieldSelector, setShowFieldSelector] = useState<number | null>(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [lookupPath, setLookupPath] = useState<{ field: Field; fields: Field[]; }[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeValueInput, setActiveValueInput] = useState<number | null>(null);

  const addCondition = () => {
    onConditionChange([
      ...conditions,
      { field: '', operator: '=', value: '', valueType: 'static' }
    ]);
  };

  const removeCondition = (index: number) => {
    onConditionChange(conditions.filter((_, i) => i !== index));
    setShowFieldSelector(null);
    setActiveValueInput(null);
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

  const handleReferenceSelect = (index: number, dataUnit: DataUnit, field: string) => {
    updateCondition(index, {
      valueType: 'reference',
      value: `{!${dataUnit.developerName}.${field}}`,
      reference: {
        dataUnit: dataUnit.developerName,
        field
      }
    });
    setActiveValueInput(null);
    setSearchTerm('');
  };

  const handleValueFocus = (index: number) => {
    setActiveValueInput(index);
    setSearchTerm('');
  };

  const handleValueBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire
    setTimeout(() => {
      if (!document.activeElement?.closest('.value-suggestions')) {
        setActiveValueInput(null);
        setSearchTerm('');
      }
    }, 200);
  };

  const handleValueChange = (index: number, value: string) => {
    if (value.startsWith('{!') || value.startsWith('{')) {
      // User is trying to type a reference, show the reference selector
      setActiveValueInput(index);
      setSearchTerm(value.replace(/^\{!?/, ''));
      updateCondition(index, { valueType: 'reference', value });
    } else {
      updateCondition(index, { valueType: 'static', value, reference: undefined });
    }
  };

  const handleReferenceButtonClick = (index: number) => {
    setActiveValueInput(index);
    setSearchTerm('');
  };

  const filteredDataUnits = useMemo(() => {
    if (!searchTerm) return existingDataUnits.filter(du => du.developerName !== currentDataUnit);
    
    const lowerSearch = searchTerm.toLowerCase();
    return existingDataUnits
      .filter(du => du.developerName !== currentDataUnit)
      .filter(du => 
        du.name.toLowerCase().includes(lowerSearch) ||
        du.developerName.toLowerCase().includes(lowerSearch) ||
        du.fields.some(field => field.toLowerCase().includes(lowerSearch))
      );
  }, [existingDataUnits, currentDataUnit, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Conditions List */}
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white rounded-lg border p-2 hover:border-docblitz-300 transition-colors">
            {/* Condition Number */}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-docblitz-50 text-docblitz-800">
              {index + 1}
            </span>

            {/* Field Selection */}
            <div className="flex-1 min-w-[150px] relative">
              <div
                onClick={() => setActiveFieldIndex(index)}
                className={`px-2 py-1 text-sm border rounded cursor-pointer hover:border-docblitz-300 ${
                  activeFieldIndex === index 
                    ? 'border-docblitz-400 ring-1 ring-docblitz bg-docblitz-50' 
                    : ''
                }`}
              >
                {condition.field || 'Select field'}
              </div>
              {activeFieldIndex === index && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50">
                  <div className="bg-white border rounded-lg shadow-lg border-docblitz-200">
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
              className="w-[100px] px-2 py-1 text-sm border rounded bg-white hover:border-docblitz-300 focus:border-docblitz-400 focus:ring-1 focus:ring-docblitz"
            >
              {OPERATORS.map((op: FilterOperator) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {/* Value Input with Smart Reference Detection */}
            <div className="flex-1 min-w-[200px] relative">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    onFocus={() => handleValueFocus(index)}
                    onBlur={handleValueBlur}
                    placeholder="Enter value"
                    className={`w-full px-2 py-1 text-sm border rounded transition-colors hover:border-docblitz-300 focus:border-docblitz-400 focus:ring-1 focus:ring-docblitz ${
                      condition.valueType === 'reference' 
                        ? 'bg-docblitz-50 border-docblitz-300' 
                        : ''
                    }`}
                  />
                </div>
                
                {/* Reference Button */}
                <button
                  type="button"
                  onClick={() => handleReferenceButtonClick(index)}
                  className={`flex items-center px-2 py-1 text-sm rounded border transition-colors ${
                    condition.valueType === 'reference'
                      ? 'bg-docblitz-50 border-docblitz-400 text-docblitz-700 hover:bg-docblitz-100'
                      : 'border-gray-200 text-gray-600 hover:bg-docblitz-50 hover:border-docblitz-300 hover:text-docblitz-700'
                  }`}
                  title="Insert a reference to another data unit's field"
                >
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                    />
                  </svg>
                  <span className="hidden sm:inline">Reference</span>
                </button>
              </div>

              {/* Search and Suggestions Overlay */}
              {activeValueInput === index && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 value-suggestions">
                  <div className="bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto border-docblitz-200">
                    {/* Search Input */}
                    <div className="sticky top-0 bg-white border-b border-docblitz-100 p-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                          <svg 
                            className="w-4 h-4 text-docblitz-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search data units and fields..."
                          className="w-full pl-8 pr-3 py-1.5 text-sm border rounded focus:border-docblitz-400 focus:ring-1 focus:ring-docblitz"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Data Units and Fields List */}
                    <div className="divide-y divide-docblitz-100">
                      {filteredDataUnits.map(dataUnit => (
                        <div key={dataUnit.developerName} className="p-2">
                          <div className="text-xs font-medium text-docblitz-800 mb-2 px-2">
                            {dataUnit.name} ({dataUnit.developerName})
                          </div>
                          <div className="space-y-0.5">
                            {dataUnit.fields
                              .filter(field => 
                                !searchTerm || 
                                field.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map(field => (
                                <div
                                  key={field}
                                  className="px-3 py-1.5 text-sm hover:bg-docblitz-50 cursor-pointer flex items-center justify-between group rounded"
                                  onClick={() => handleReferenceSelect(index, dataUnit, field)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>{field}</span>
                                    <span className="text-xs text-gray-400 group-hover:text-docblitz-700">
                                      from {dataUnit.developerName}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400 group-hover:text-docblitz-700 hidden group-hover:inline">
                                    Select
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}

                      {filteredDataUnits.length === 0 && (
                        <div className="p-4 text-center text-sm text-docblitz-800 bg-docblitz-50">
                          No matching data units or fields found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeCondition(index)}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
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
        className="inline-flex items-center text-sm text-docblitz-600 hover:text-docblitz-700"
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
            className="w-full px-3 py-2 text-sm border rounded-md hover:border-docblitz-300 focus:border-docblitz-400 focus:ring-1 focus:ring-docblitz"
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