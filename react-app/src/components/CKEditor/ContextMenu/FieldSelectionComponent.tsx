import React, { useState, useEffect } from 'react';
import { Field } from '../types';
import { useSalesforce } from '../../../contexts/SalesforceContext';
import { DataUnit } from '../../SF/Toolbox/DataUnits/types';

interface FieldSelectionProps {
  selectedObject: string | null;
  objectFields: Field[];
  isLoadingFields: boolean;
  onObjectSelect: (objectName: string) => void;
  onFieldSelect: (field: Field) => void;
  onReset: () => void;
  onPreviewChange: (mergeField: string, label: string) => void;
  isAdvancedMode?: boolean;
  dataUnits?: Array<{
    name: string;
    developerName: string;
    fields: string[];
  }>;
}

interface LookupPath {
  field: Field;
  fields: Field[];
}

export const FieldSelectionComponent: React.FC<FieldSelectionProps> = ({
  selectedObject,
  objectFields,
  isLoadingFields,
  onObjectSelect,
  onFieldSelect,
  onReset,
  onPreviewChange,
  isAdvancedMode = false,
  dataUnits = [],
}) => {
  const { objects: sfObjects, loadFields } = useSalesforce();
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [fieldSearchTerm, setFieldSearchTerm] = useState('');
  const [lookupPath, setLookupPath] = useState<LookupPath[]>([]);
  const [isLoadingLookupFields, setIsLoadingLookupFields] = useState(false);
  const [selectedDataUnit, setSelectedDataUnit] = useState<DataUnit | null>(null);

  // Reset selected data unit when switching modes
  useEffect(() => {
    setSelectedDataUnit(null);
    setObjectSearchTerm('');
    setFieldSearchTerm('');
    setLookupPath([]);
  }, [isAdvancedMode]);

  // Filter objects based on search term
  const filteredObjects = isAdvancedMode
    ? dataUnits.filter(unit => 
        unit.name.toLowerCase().includes(objectSearchTerm.toLowerCase()) ||
        unit.developerName.toLowerCase().includes(objectSearchTerm.toLowerCase())
      )
    : objectSearchTerm
      ? sfObjects
          .filter(obj => 
            obj.label.toLowerCase().includes(objectSearchTerm.toLowerCase()) ||
            obj.value.toLowerCase().includes(objectSearchTerm.toLowerCase())
          )
          .slice(0, 10)
      : sfObjects.slice(0, 10);

  // Get current fields to display based on lookup path or data unit
  const getCurrentFields = (): Field[] => {
    if (isAdvancedMode && selectedDataUnit) {
      return selectedDataUnit.fields.map(field => ({
        label: field.split('.').pop() || field,
        value: field,
        type: 'string', // We might want to store field types in data units later
      }));
    }
    return lookupPath.length > 0 ? lookupPath[lookupPath.length - 1].fields : objectFields;
  };

  // Filter fields based on search term
  const filteredFields = fieldSearchTerm
    ? getCurrentFields()
        .filter(field => 
          field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
          field.value.toLowerCase().includes(fieldSearchTerm.toLowerCase())
        )
        .slice(0, 10)
    : getCurrentFields().slice(0, 10);

  const handleFieldSelect = (field: Field) => {
    if (isAdvancedMode && selectedDataUnit) {
      // In advanced mode, we use the field directly from the data unit
      const mergeField = `{${selectedDataUnit.developerName}.${field.value}}`;
      const label = `${selectedDataUnit.name} → ${field.label}`;
      onPreviewChange(mergeField, label);
      return;
    }

    if (selectedObject && field.value) {
      if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
        handleLookupFieldSelect(field);
        return;
      }

      // Build the merge field path
      let mergeField = `{${selectedObject}`;
      let label = '';

      lookupPath.forEach((path, index) => {
        mergeField += `.${path.field.value}`;
        label += `${path.field.label} → `;
      });

      mergeField += `.${field.value}}`;
      label += field.label;

      onPreviewChange(mergeField, label);
      setLookupPath([]);
      setFieldSearchTerm('');
    }
  };

  const getFieldTypeLabel = (field: Field) => {
    // Map Salesforce API field types to readable labels
    const typeMap: { [key: string]: string } = {
      'string': 'Text',
      'boolean': 'Checkbox',
      'double': 'Number',
      'date': 'Date',
      'datetime': 'Date/Time',
      'email': 'Email',
      'phone': 'Phone',
      'url': 'URL',
      'currency': 'Currency',
      'textarea': 'Text Area',
      'picklist': 'Picklist',
      'multipicklist': 'Multi-Select',
      'reference': 'Lookup',
      'id': 'ID',
      'int': 'Number',
      'percent': 'Percent',
      'address': 'Address',
      'base64': 'File',
      'encryptedstring': 'Encrypted Text',
      'time': 'Time',
      'anyType': 'Any',
      'combobox': 'Combobox',
      'datacategorygroupreference': 'Category',
      'location': 'Location',
      'complexvalue': 'Complex Value'
    };

    // Special handling for reference fields
    if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
      return `Lookup(${field.referenceTo})`;
    }

    // Convert type to lowercase for case-insensitive matching
    const normalizedType = (field.type || '').toLowerCase();
    return typeMap[normalizedType] || field.type || 'Text';
  };

  const handleLookupFieldSelect = async (field: Field) => {
    setIsLoadingLookupFields(true);
    
    try {
      if (field.referenceTo) {
        // Load fields from the referenced object
        const fields = await loadFields(
          window.localStorage.getItem('sf_instance_url') || '',
          window.localStorage.getItem('sf_access_token') || '',
          field.referenceTo
        );
        // Add the new lookup level to the path
        setLookupPath([...lookupPath, { field, fields }]);
        setFieldSearchTerm('');
      }
    } catch (error) {
      console.error('Error loading lookup fields:', error);
    } finally {
      setIsLoadingLookupFields(false);
    }
  };

  const handleBackClick = () => {
    if (lookupPath.length > 0) {
      // Remove the last lookup level
      setLookupPath(lookupPath.slice(0, -1));
      setFieldSearchTerm('');
    }
  };

  return (
    <div className="space-y-4">
      {!selectedObject && !selectedDataUnit ? (
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isAdvancedMode ? "Search data units..." : "Search Salesforce objects..."}
            value={objectSearchTerm}
            onChange={(e) => setObjectSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {isAdvancedMode ? (
              filteredObjects.map((unit) => (
                <div
                  key={unit.developerName}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => {
                    setSelectedDataUnit(unit);
                    setObjectSearchTerm('');
                  }}
                >
                  <span className="font-medium">{unit.name}</span>
                  <span className="text-sm text-gray-500">{unit.developerName}</span>
                </div>
              ))
            ) : (
              filteredObjects.map((obj) => (
                <div
                  key={obj.value}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => {
                    onObjectSelect(obj.value);
                    setObjectSearchTerm('');
                  }}
                >
                  <span className="font-medium">{obj.label}</span>
                  <span className="text-sm text-gray-500">{obj.value}</span>
                </div>
              ))
            )}
            {objectSearchTerm && filteredObjects.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-center">
                No {isAdvancedMode ? 'data units' : 'objects'} found
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="font-medium text-gray-700">
              {isAdvancedMode && selectedDataUnit
                ? selectedDataUnit.name
                : sfObjects.find(obj => obj.value === selectedObject)?.label}
            </div>
            <button
              className="text-blue-500 text-sm hover:text-blue-700"
              onClick={() => {
                onReset();
                setObjectSearchTerm('');
                setFieldSearchTerm('');
                setLookupPath([]);
                setSelectedDataUnit(null);
              }}
            >
              Change {isAdvancedMode ? 'Data Unit' : 'Object'}
            </button>
          </div>
          
          {/* Lookup Path Breadcrumbs - Only show in basic mode */}
          {!isAdvancedMode && lookupPath.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span>{sfObjects.find(obj => obj.value === selectedObject)?.label}</span>
              {lookupPath.map((path, index) => (
                <React.Fragment key={index}>
                  <span className="text-gray-400">→</span>
                  <span>{path.field.label}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {/* Field selection */}
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search fields..."
                value={fieldSearchTerm}
                onChange={(e) => setFieldSearchTerm(e.target.value)}
                autoFocus
              />

              {(isLoadingFields || isLoadingLookupFields) ? (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
                  Loading fields...
                </div>
              ) : (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredFields.map((field) => (
                    <div
                      key={field.value}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleFieldSelect(field)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{field.label}</span>
                        {!isAdvancedMode && field.type?.toLowerCase() === 'reference' && field.referenceTo ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLookupFieldSelect(field);
                            }}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            Lookup({field.referenceTo})
                          </button>
                        ) : (
                          <span className="text-gray-500">{getFieldTypeLabel(field)}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {field.value}
                      </div>
                    </div>
                  ))}
                  {fieldSearchTerm && filteredFields.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-center">
                      No fields found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FieldSelectionComponent; 