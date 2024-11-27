import React, { useState } from 'react';
import { Field, FieldSelectionProps } from '../types';
import { useSalesforce } from '../../../contexts/SalesforceContext';

export const FieldSelectionComponent: React.FC<FieldSelectionProps> = ({
  selectedObject,
  objectFields,
  isLoadingFields,
  onObjectSelect,
  onFieldSelect,
  onReset,
}) => {
  const { objects: sfObjects } = useSalesforce();
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [fieldSearchTerm, setFieldSearchTerm] = useState('');

  // Filter objects based on search term
  const filteredObjects = objectSearchTerm 
    ? sfObjects
        .filter(obj => 
          obj.label.toLowerCase().includes(objectSearchTerm.toLowerCase()) ||
          obj.value.toLowerCase().includes(objectSearchTerm.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Filter fields based on search term
  const filteredFields = fieldSearchTerm
    ? objectFields
        .filter(field => 
          field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
          field.value.toLowerCase().includes(fieldSearchTerm.toLowerCase())
        )
        .slice(0, 10)
    : [];

  return (
    <div className="space-y-4">
      {!selectedObject ? (
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type to search objects..."
            value={objectSearchTerm}
            onChange={(e) => setObjectSearchTerm(e.target.value)}
            autoFocus
          />
          {filteredObjects.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredObjects.map((obj) => (
                <li
                  key={obj.value}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    onObjectSelect(obj.value);
                    setObjectSearchTerm('');
                  }}
                >
                  <span className="flex-1">{obj.label}</span>
                  <span className="text-xs text-gray-500">{obj.value}</span>
                </li>
              ))}
            </ul>
          )}
          {objectSearchTerm && filteredObjects.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-2 text-gray-500 text-center">
              No matching objects found
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-2">
            <div className="flex-1 font-medium text-gray-700">
              {sfObjects.find(obj => obj.value === selectedObject)?.label}
            </div>
            <button
              className="text-blue-500 text-sm hover:text-blue-700"
              onClick={() => {
                onReset();
                setObjectSearchTerm('');
                setFieldSearchTerm('');
              }}
            >
              Change
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type to search fields..."
              value={fieldSearchTerm}
              onChange={(e) => setFieldSearchTerm(e.target.value)}
              autoFocus
            />
            {isLoadingFields ? (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-2 text-center">
                Loading fields...
              </div>
            ) : (
              filteredFields.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredFields.map((field) => (
                    <li
                      key={field.value}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        onFieldSelect(field.value);
                        setFieldSearchTerm('');
                      }}
                    >
                      <span className="flex-1">{field.label}</span>
                      <span className="text-xs text-gray-500">{field.value}</span>
                    </li>
                  ))}
                </ul>
              )
            )}
            {fieldSearchTerm && !isLoadingFields && filteredFields.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-2 text-gray-500 text-center">
                No matching fields found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSelectionComponent; 