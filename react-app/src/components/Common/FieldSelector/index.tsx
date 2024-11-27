import React, { useState, useEffect } from 'react';
import Select from '../Select/Select';
import { Field } from '../../SF';

interface FieldSelectorProps {
  onFieldSelect: (field: string, append: boolean) => void;
  objects: Array<{ value: string; label: string }>;
  getFields: (objectName: string) => Promise<Array<{ value: string; label: string }>>;
  className?: string;
  onAddCondition?: () => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ 
  onFieldSelect, 
  objects = [],
  getFields,
  className = '',
  onAddCondition
}) => {
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [fields, setFields] = useState<{ [key: string]: Array<{ value: string; label: string }> }>({});

  // No need to filter objects as they should already be in the correct format
  const filteredObjects = objects;

  // Get fields for the selected object
  const filteredFields = selectedObject ? fields[selectedObject] || [] : [];

  // Fetch fields when object is selected
  useEffect(() => {
    if (!selectedObject) return;

    const fetchObjectFields = async () => {
      try {
        const fieldsList = await getFields(selectedObject);
        setFields(prev => ({
          ...prev,
          [selectedObject]: fieldsList
        }));
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
    <div className={`space-y-4 ${className}`} onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Object
        </label>
        <Select
          options={filteredObjects}
          value={selectedObject}
          onChange={(value) => {
            setSelectedObject(value);
            setSelectedField('');
          }}
          placeholder="Select an object..."
          className="w-full"
          enableSearch={true}
        />
      </div>
      
      {selectedObject && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Field
          </label>
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
      )}

      {onAddCondition && (
        <button
          onClick={onAddCondition}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          Add Condition
        </button>
      )}
    </div>
  );
};

export default FieldSelector; 