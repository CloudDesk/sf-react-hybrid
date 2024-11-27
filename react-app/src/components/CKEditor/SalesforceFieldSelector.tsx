import React, { useState, useEffect } from 'react';
import Select from '../Common/Select/Select';
import { Field } from '../SF/index';

interface SalesforceFieldSelectorProps {
  onFieldSelect: (field: string, append: boolean) => void;
  objects: Array<{ value: string; label: string }>;
  getFields: (objectName: string) => Promise<Field[]>;
}

const SalesforceFieldSelector: React.FC<SalesforceFieldSelectorProps> = ({ 
  onFieldSelect, 
  objects = [],
  getFields 
}) => {
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [fields, setFields] = useState<{ [key: string]: Field[] }>({});
  const [searchObject, setSearchObject] = useState('');
  const [searchField, setSearchField] = useState('');

  // Filter objects based on search with proper type checking
  const filteredObjects = Array.isArray(objects) ? objects
    .filter(obj => obj && typeof obj === 'object' && 'label' in obj && obj.label)
    .filter(obj => 
      obj.label.toLowerCase().includes((searchObject || '').toLowerCase())
    ) : [];

  // Filter fields based on search with proper type checking
  const filteredFields = selectedObject && fields[selectedObject] 
    ? fields[selectedObject]
        .filter(field => field && typeof field === 'object' && 'label' in field && field.label)
        .map(field => ({
          value: field.name,
          label: field.label
        }))
    : [];

  // Fetch fields when object is selected
  useEffect(() => {
    if (!selectedObject) return;

    const fetchObjectFields = async () => {
      try {
        const fieldsList = await getFields(selectedObject);
        if (Array.isArray(fieldsList)) {
          setFields(prev => ({
            ...prev,
            [selectedObject]: fieldsList
          }));
        }
      } catch (error) {
        console.error('Error fetching fields:', error);
        setFields(prev => ({
          ...prev,
          [selectedObject]: []
        }));
      }
    };

    if (!fields[selectedObject]) {
      fetchObjectFields();
    }
  }, [selectedObject, getFields]);

  return (
    <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Object
        </label>
        <div className="space-y-2">
          <Select
            options={filteredObjects}
            value={selectedObject}
            onChange={(value) => {
              setSelectedObject(value);
              setSelectedField('');
              setSearchField('');
            }}
            placeholder="Select an object..."
            className="w-full"
            enableSearch={true}
          />
        </div>
      </div>
      
      {selectedObject && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Field
          </label>
          <div className="space-y-2">
            <Select
              options={filteredFields}
              value={selectedField}
              onChange={(value) => {
                setSelectedField(value);
                const confirmAction = window.confirm('Do you want to append or replace?\nOK = Append, Cancel = Replace');
                onFieldSelect(`{${selectedObject}.${value}}`, confirmAction);
              }}
              placeholder="Select a field..."
              className="w-full"
              enableSearch={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesforceFieldSelector; 