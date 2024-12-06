import React, { useState, useEffect } from 'react';
import Select from '../Select/Select';
import { Field } from '../../SF';
import useFieldFetcher from '../../../Hooks/useFieldFetcher';
import { ChevronRight, Search } from 'lucide-react';

interface FieldSelectorProps {
  onFieldSelect: (field: string) => void;
  instanceUrl: string;
  accessToken: string;
  className?: string;
  onAddCondition?: () => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({
  onFieldSelect,
  instanceUrl,
  accessToken,
  className = '',
  onAddCondition
}) => {
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [searchField, setSearchField] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<string[]>([]);

  const {
    sObjects,
    fields,
    referenceFields,
    fetchFields,
    isFieldLoading
  } = useFieldFetcher(instanceUrl, accessToken);

  // Format objects for Select component
  const formattedObjects = sObjects.map(obj => ({
    value: obj,
    label: obj
  }));

  // Get current fields
  const currentFields = fields[selectedObject] || [];

  // Filter fields based on search
  const filteredFields = currentFields.filter(field =>
    field.label?.toLowerCase().includes(searchField.toLowerCase()) ||
    field.name?.toLowerCase().includes(searchField.toLowerCase())
  );

  // Separate standard and reference fields
  const standardFields = filteredFields.filter(field => field.type !== 'reference');
  const relatedFields = filteredFields.filter(field => field.type === 'reference');

  useEffect(() => {
    if (selectedObject) {
      fetchFields(selectedObject);
    }
  }, [selectedObject, fetchFields]);

  const handleObjectChange = (value: string) => {
    setSelectedObject(value);
    setSearchField('');
    setExpandedRefs([]);
  };

  const toggleReferenceField = (fieldName: string) => {
    setExpandedRefs(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  return (
    <div className={`space-y-4 ${className}`} onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Object
        </label>
        <Select
          options={formattedObjects}
          value={selectedObject}
          onChange={handleObjectChange}
          placeholder="Select an object..."
        // enableSearch={true}
        />
      </div>

      {selectedObject && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Fields
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search fields..."
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
            {isFieldLoading ? (
              <div className="p-4 text-center text-gray-500">Loading fields...</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Standard Fields */}
                {standardFields.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                      Standard Fields ({standardFields.length})
                    </h3>
                    <ul className="space-y-1">
                      {standardFields.map((field) => (
                        <li
                          key={field.name}
                          onClick={() => {

                            onFieldSelect(`{${field.name}}`);
                          }}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md"
                        >
                          <span className="text-sm font-medium text-gray-700">{field.label}</span>
                          <span className="text-xs text-gray-500 block">API: {field.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reference Fields */}
                {relatedFields.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                      Related Fields ({relatedFields.length})
                    </h3>
                    <ul className="space-y-1">
                      {relatedFields.map((field) => (
                        <li key={field.name} className="rounded-md overflow-hidden">
                          <div
                            onClick={() => toggleReferenceField(field.name)}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-700">{field.label}</span>
                              <span className="text-xs text-gray-500 block">API: {field.name}</span>
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-200 ${expandedRefs.includes(field.name) ? 'transform rotate-90' : ''
                                }`}
                            />
                          </div>
                          {expandedRefs.includes(field.name) && referenceFields[selectedObject]?.[field.name] && (
                            <ul className="pl-4 border-l border-gray-200 ml-4 bg-gray-50">
                              {referenceFields[selectedObject][field.name].map((refField) => (
                                <li
                                  key={refField.name}
                                  onClick={() => {
                                    onFieldSelect(
                                      `{#${field.relationshipName}}${refField.name}{/}`
                                    );
                                  }}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  <span className="text-sm font-medium text-gray-700">{refField.label}</span>
                                  <span className="text-xs text-gray-500 block">
                                    API: {field.relationshipName}.{refField.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {filteredFields.length === 0 && !isFieldLoading && (
                  <div className="p-4 text-center text-gray-500">
                    No fields found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {onAddCondition && (
        <button
          onClick={onAddCondition}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 
                   rounded-lg hover:bg-blue-100 transition-all duration-200 
                   border border-blue-200 hover:border-blue-300"
        >
          Add Condition
        </button>
      )}
    </div>
  );
};

export default FieldSelector; 