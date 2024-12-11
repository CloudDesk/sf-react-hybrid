import React from 'react';
import { Field } from '../../../CKEditor/types';

interface AdvancedFieldSelectionProps {
  fields: Field[];
  selectedFields: string[];
  onFieldSelect: (field: Field) => void;
  onLookupSelect: (field: Field) => void;
  onBack: () => void;
  lookupPath: { field: Field; fields: Field[]; }[];
  isLoading: boolean;
  isFieldSelected?: (field: Field) => boolean;
}

export const AdvancedFieldSelection: React.FC<AdvancedFieldSelectionProps> = ({
  fields,
  selectedFields,
  onFieldSelect,
  onLookupSelect,
  onBack,
  lookupPath,
  isLoading,
  isFieldSelected,
}) => {
  const isSelected = (field: Field) => {
    if (isFieldSelected) {
      return isFieldSelected(field);
    }
    return selectedFields.includes(field.value);
  };

  const getFieldTypeLabel = (field: Field): string => {
    if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
      return `Lookup(${field.referenceTo})`;
    }
    return field.type || 'Text';
  };

  return (
    <div className="bg-white">
      {/* Lookup Path Navigation */}
      {lookupPath.length > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-gray-50 border-b">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center text-sm text-gray-600">
            {lookupPath.map((item, index) => (
              <React.Fragment key={item.field.value}>
                {index > 0 && <span className="mx-2">→</span>}
                <span>{item.field.label}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="divide-y max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading fields...</div>
        ) : (
          fields.map((field) => (
            <div
              key={field.value}
              className="flex items-center justify-between p-2 hover:bg-gray-50 group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected(field)}
                  onChange={() => onFieldSelect(field)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-900 truncate">{field.label}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{getFieldTypeLabel(field)}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate">{field.value}</div>
                </div>
              </div>
              {field.type === 'reference' && field.referenceTo && (
                <button
                  onClick={() => onLookupSelect(field)}
                  className="text-sm text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Lookup({field.referenceTo})
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
