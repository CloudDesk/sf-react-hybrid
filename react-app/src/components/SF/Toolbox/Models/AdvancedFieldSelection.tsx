import React, { useState, useEffect, useRef } from 'react';
import { Field } from '../../../CKEditor/types';

interface AdvancedFieldSelectionProps {
  selectedObject: string | null;
  objectFields: Field[];
  selectedFields: string[];
  onFieldSelect: (fields: string[]) => void;
  loadFields: (objectName: string) => Promise<Field[]>;
}

const AdvancedFieldSelection: React.FC<AdvancedFieldSelectionProps> = ({
  selectedObject,
  objectFields,
  selectedFields,
  onFieldSelect,
  loadFields,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter fields based on search
  useEffect(() => {
    const filtered = objectFields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFields(filtered);
  }, [searchTerm, objectFields]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeField = (fieldToRemove: string) => {
    onFieldSelect(selectedFields.filter(field => field !== fieldToRemove));
  };

  const reorderFields = (fromIndex: number, toIndex: number) => {
    const newFields = [...selectedFields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    onFieldSelect(newFields);
  };

  return (
    <div className="space-y-4">
      {/* Field Search and Selection */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search and select fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
            />
          </div>
          <button
            onClick={() => onFieldSelect([])}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        </div>

        {/* Dropdown for field selection */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredFields.map((field) => (
              <div
                key={field.value}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  const newFields = selectedFields.includes(field.value)
                    ? selectedFields.filter(f => f !== field.value)
                    : [...selectedFields, field.value];
                  onFieldSelect(newFields);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.value)}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                />
                <span className="flex-1">{field.label}</span>
                <span className="text-xs text-gray-500">{field.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Fields List */}
      <div className="space-y-1">
        {selectedFields.map((field, index) => (
          <div
            key={field}
            className="flex items-center justify-between p-2 bg-white border rounded-md group"
          >
            <div className="flex items-center space-x-3">
              <div className="text-gray-400 cursor-move">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 15h8" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">{field}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {index > 0 && (
                <button
                  onClick={() => reorderFields(index, index - 1)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}
              {index < selectedFields.length - 1 && (
                <button
                  onClick={() => reorderFields(index, index + 1)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => removeField(field)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {selectedFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No fields selected
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFieldSelection; 