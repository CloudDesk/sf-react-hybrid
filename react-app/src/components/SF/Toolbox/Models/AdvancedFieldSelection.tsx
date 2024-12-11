import React, { useState, useEffect, useRef } from 'react';
import { Field } from '../../../CKEditor/types';

interface AdvancedFieldSelectionProps {
  selectedObject: string | null;
  objectFields: Field[];
  selectedFields: string[];
  onFieldSelect: (fields: string[]) => void;
  loadFields: (objectName: string) => Promise<Field[]>;
}

interface LookupPath {
  field: Field;
  fields: Field[];
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
  const [lookupPath, setLookupPath] = useState<LookupPath[]>([]);
  const [isLoadingLookupFields, setIsLoadingLookupFields] = useState(false);

  // Get current fields to display based on lookup path
  const currentFields = lookupPath.length > 0 
    ? lookupPath[lookupPath.length - 1].fields 
    : objectFields;

  // Filter fields based on search
  useEffect(() => {
    const filtered = currentFields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFields(filtered);
  }, [searchTerm, currentFields]);

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

  const handleLookupFieldSelect = async (field: Field) => {
    setIsLoadingLookupFields(true);
    
    try {
      if (field.referenceTo) {
        // Load fields from the referenced object
        const fields = await loadFields(field.referenceTo);
        // Add the new lookup level to the path
        setLookupPath([...lookupPath, { field, fields }]);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error loading lookup fields:', error);
    } finally {
      setIsLoadingLookupFields(false);
    }
  };

  const handleFieldSelect = (field: Field) => {
    if (selectedObject && field.value) {
      if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
        // Don't create merge field yet, show lookup fields
        handleLookupFieldSelect(field);
        return;
      }

      // Build the field path
      let fieldPath = field.value;

      // Add lookup paths in reverse order
      for (let i = lookupPath.length - 1; i >= 0; i--) {
        fieldPath = `${lookupPath[i].field.value}.${fieldPath}`;
      }

      // Add to selected fields if not already present
      if (!selectedFields.includes(fieldPath)) {
        onFieldSelect([...selectedFields, fieldPath]);
      }
      
      // Reset lookup state
      setLookupPath([]);
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  const handleBackClick = () => {
    if (lookupPath.length > 0) {
      // Remove the last lookup level
      setLookupPath(lookupPath.slice(0, -1));
      setSearchTerm('');
    }
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

        {/* Lookup Path Breadcrumbs */}
        {lookupPath.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 mt-2 rounded">
            {lookupPath.map((path, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">→</span>}
                <span>{path.field.label}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Dropdown for field selection */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoadingLookupFields ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                Loading fields...
              </div>
            ) : (
              <>
                {lookupPath.length > 0 && (
                  <div className="px-3 py-2 bg-gray-50 border-b flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Selecting fields from {lookupPath[lookupPath.length - 1].field.label}
                    </span>
                    <button
                      className="text-blue-500 text-sm hover:text-blue-700"
                      onClick={handleBackClick}
                    >
                      Back
                    </button>
                  </div>
                )}
                {filteredFields.map((field) => (
                  <div
                    key={field.value}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleFieldSelect(field)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.value)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                    />
                    <span className="flex-1">{field.label}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {field.type === 'reference' ? `Lookup(${field.referenceTo})` : field.type}
                    </span>
                  </div>
                ))}
              </>
            )}
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