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
  onPreviewChange,
}) => {
  const { objects: sfObjects, loadFields } = useSalesforce();
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [fieldSearchTerm, setFieldSearchTerm] = useState('');
  const [selectedLookupField, setSelectedLookupField] = useState<Field | null>(null);
  const [lookupFields, setLookupFields] = useState<Field[]>([]);
  const [isLoadingLookupFields, setIsLoadingLookupFields] = useState(false);
  const [lookupFieldSearchTerm, setLookupFieldSearchTerm] = useState('');

  // Filter objects based on search term
  const filteredObjects = objectSearchTerm
    ? sfObjects
        .filter(obj => 
          obj.label.toLowerCase().includes(objectSearchTerm.toLowerCase()) ||
          obj.value.toLowerCase().includes(objectSearchTerm.toLowerCase())
        )
        .slice(0, 10)
    : sfObjects.slice(0, 10);

  // Filter fields based on search term and selected object
  const filteredFields = fieldSearchTerm && selectedObject
    ? objectFields
        .filter(field => 
          field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
          field.value.toLowerCase().includes(fieldSearchTerm.toLowerCase())
        )
        .slice(0, 10)
    : objectFields.slice(0, 10);

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
    setSelectedLookupField(field);
    setIsLoadingLookupFields(true);
    
    try {
      if (field.referenceTo) {
        // Load fields from the referenced object
        const fields = await loadFields(
          window.localStorage.getItem('sf_instance_url') || '',
          window.localStorage.getItem('sf_access_token') || '',
          field.referenceTo
        );
        setLookupFields(fields);
      }
    } catch (error) {
      console.error('Error loading lookup fields:', error);
      setLookupFields([]);
    } finally {
      setIsLoadingLookupFields(false);
    }
  };

  const handleFieldSelect = (field: Field, lookupField?: Field) => {
    if (selectedObject && field.value) {
      let mergeField: string;
      
      if (lookupField) {
        // Format: {Object.LookupField.Field}
        mergeField = `{${selectedObject}.${field.value}.${lookupField.value}}`;
      } else if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
        // Don't create merge field yet, show lookup fields
        handleLookupFieldSelect(field);
        return;
      } else {
        // Normal field
        mergeField = `{${selectedObject}.${field.value}}`;
      }
      
      onPreviewChange(mergeField, lookupField ? `${field.label} → ${lookupField.label}` : field.label);
      // Reset lookup state
      setSelectedLookupField(null);
      setLookupFields([]);
      setLookupFieldSearchTerm('');
    }
  };

  // Filter lookup fields
  const filteredLookupFields = lookupFieldSearchTerm
    ? lookupFields.filter(field =>
        field.label.toLowerCase().includes(lookupFieldSearchTerm.toLowerCase()) ||
        field.value.toLowerCase().includes(lookupFieldSearchTerm.toLowerCase())
      ).slice(0, 10)
    : lookupFields.slice(0, 10);

  return (
    <div className="space-y-4">
      {!selectedObject ? (
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search Salesforce objects..."
            value={objectSearchTerm}
            onChange={(e) => setObjectSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredObjects.map((obj) => (
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
            ))}
            {objectSearchTerm && filteredObjects.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-center">
                No objects found
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="font-medium text-gray-700">
              {sfObjects.find(obj => obj.value === selectedObject)?.label}
            </div>
            <button
              className="text-blue-500 text-sm hover:text-blue-700"
              onClick={() => {
                onReset();
                setObjectSearchTerm('');
                setFieldSearchTerm('');
                setSelectedLookupField(null);
                setLookupFields([]);
              }}
            >
              Change Object
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Main field selection */}
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={selectedLookupField ? `Search ${selectedLookupField.label} fields...` : "Search fields..."}
                value={selectedLookupField ? lookupFieldSearchTerm : fieldSearchTerm}
                onChange={(e) => selectedLookupField ? setLookupFieldSearchTerm(e.target.value) : setFieldSearchTerm(e.target.value)}
                autoFocus
              />
              
              {(isLoadingFields || isLoadingLookupFields) ? (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                  <div className="px-3 py-2 text-gray-500 text-center">
                    Loading fields...
                  </div>
                </div>
              ) : (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {selectedLookupField ? (
                    // Show lookup fields
                    <>
                      <div className="px-3 py-2 bg-gray-50 border-b flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Selecting fields from {selectedLookupField.label}
                        </span>
                        <button
                          className="text-blue-500 text-sm hover:text-blue-700"
                          onClick={() => setSelectedLookupField(null)}
                        >
                          Back
                        </button>
                      </div>
                      {filteredLookupFields.map((field) => (
                        <div
                          key={field.value}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                          onClick={() => handleFieldSelect(selectedLookupField, field)}
                        >
                          <span className="font-medium">{field.label}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                            {getFieldTypeLabel(field)}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Show main fields
                    filteredFields.map((field) => (
                      <div
                        key={field.value}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                        onClick={() => handleFieldSelect(field)}
                      >
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                          {getFieldTypeLabel(field)}
                        </span>
                      </div>
                    ))
                  )}
                  {((selectedLookupField ? lookupFieldSearchTerm : fieldSearchTerm) && 
                    (selectedLookupField ? filteredLookupFields : filteredFields).length === 0) && (
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