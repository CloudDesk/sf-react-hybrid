import React, { useState, useEffect, useRef } from 'react';
import { Field } from '../../../CKEditor/types';

interface AdvancedFieldSelectionProps {
  selectedObject: string | null;
  objectFields: Field[];
  selectedFields: string[];
  onFieldSelect: (fields: string[]) => void;
  loadFields: (objectName: string) => Promise<Field[]>;
}

interface BreadcrumbItem {
  object: string;
  field?: string;
  label: string;
}

const AdvancedFieldSelection: React.FC<AdvancedFieldSelectionProps> = ({
  selectedObject,
  objectFields,
  selectedFields,
  onFieldSelect,
  loadFields,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentFields, setCurrentFields] = useState<Field[]>(objectFields);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Initialize with object fields
  useEffect(() => {
    setCurrentFields(objectFields);
    setBreadcrumbs([{ object: selectedObject!, label: 'Fields' }]);
  }, [objectFields, selectedObject]);

  // Filter fields based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = currentFields.filter(field => 
        field.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFields(filtered);
    } else {
      setFilteredFields(currentFields);
    }
  }, [searchTerm, currentFields]);

  const handleFieldClick = async (field: Field) => {
    if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
      // Load fields for the referenced object
      const parentFields = await loadFields(field.referenceTo);
      setCurrentFields(parentFields);
      setBreadcrumbs([...breadcrumbs, { 
        object: field.referenceTo, 
        field: field.value,
        label: field.label 
      }]);
    } else {
      // Handle normal field selection
      const fieldPath = breadcrumbs
        .slice(1)
        .map(b => b.field)
        .concat(field.value)
        .join('.');
      
      const newFields = selectedFields.includes(fieldPath)
        ? selectedFields.filter(f => f !== fieldPath)
        : [...selectedFields, fieldPath];
      
      onFieldSelect(newFields);
    }
  };

  const handleBreadcrumbClick = async (index: number) => {
    if (index === 0) {
      setCurrentFields(objectFields);
      setBreadcrumbs([breadcrumbs[0]]);
    } else {
      const targetBreadcrumb = breadcrumbs[index];
      const parentFields = await loadFields(targetBreadcrumb.object);
      setCurrentFields(parentFields);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
        />
      </div>
      
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Breadcrumbs */}
          <div className="sticky top-0 bg-gray-50 border-b px-3 py-2 flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <button
                  className="hover:text-blue-600"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Fields List */}
          {filteredFields.map((field) => (
            <div
              key={field.value}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
              onClick={() => handleFieldClick(field)}
            >
              <div className="flex items-center">
                {field.type?.toLowerCase() !== 'reference' && (
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(
                      breadcrumbs
                        .slice(1)
                        .map(b => b.field)
                        .concat(field.value)
                        .join('.')
                    )}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                )}
                <span className="font-medium text-gray-900">{field.label}</span>
              </div>
              {field.type?.toLowerCase() === 'reference' && (
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SOQL Preview */}
      {selectedFields.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <div className="text-xs font-medium text-gray-500 mb-1">SOQL Preview</div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {`SELECT ${selectedFields.join(',\n       ')}\nFROM ${selectedObject}`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdvancedFieldSelection; 