import React, { useState, useEffect } from 'react';
import { useSalesforce } from '../../../../contexts/SalesforceContext';
import { Field } from '../../../CKEditor/types';
import AdvancedFieldSelection from './AdvancedFieldSelection';
import FilterBuilder from './FilterBuilder';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface FilterCondition {
  id: number;
  field: string;
  operator: string;
  value: string;
}

interface Model {
  name: string;
  developerName: string;
  description: string;
  object: string;
  fields: string[];
  filters: FilterCondition[];
  filterLogic: string;
}

interface ModelManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (model: Model) => void;
  editingModel: Model | null;
}

type TabType = 'info' | 'fields' | 'filters';

const ModelManagementModal: React.FC<ModelManagementModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editingModel,
}) => {
  const { objects, loadFields } = useSalesforce();
  const [name, setName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [objectFields, setObjectFields] = useState<Field[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterLogic, setFilterLogic] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isSqlPreviewOpen, setIsSqlPreviewOpen] = useState(true);

  useEffect(() => {
    if (selectedObject) {
      setIsLoadingFields(true);
      loadFields(
        localStorage.getItem('sf_instance_url') || '',
        localStorage.getItem('sf_access_token') || '',
        selectedObject
      ).then((fields) => {
        setObjectFields(fields);
        setIsLoadingFields(false);
      }).catch(() => {
        setObjectFields([]);
        setIsLoadingFields(false);
      });
    } else {
      setObjectFields([]);
    }
  }, [selectedObject, loadFields]);

  useEffect(() => {
    if (editingModel) {
      setName(editingModel.name);
      setDeveloperName(editingModel.developerName);
      setDescription(editingModel.description);
      setSelectedObject(editingModel.object);
      setSelectedFields(editingModel.fields);
      setFilterConditions(editingModel.filters || []);
      setFilterLogic(editingModel.filterLogic || '');
    } else {
      setName('');
      setDeveloperName('');
      setDescription('');
      setSelectedObject('');
      setSelectedFields([]);
      setFilterConditions([]);
      setFilterLogic('');
    }
  }, [editingModel]);

  const handleSubmit = () => {
    onCreate({
      name,
      developerName,
      description,
      object: selectedObject,
      fields: selectedFields,
      filters: filterConditions,
      filterLogic,
    });
  };

  const handleObjectSelect = (objectName: string) => {
    setSelectedObject(objectName);
    setSelectedFields(['Id']);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Developer Name</label>
              <input
                type="text"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Object</label>
              <select
                value={selectedObject}
                onChange={(e) => handleObjectSelect(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select an object</option>
                {objects.map((obj) => (
                  <option key={obj.value} value={obj.value}>
                    {obj.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'fields':
        return selectedObject ? (
          <AdvancedFieldSelection
            selectedObject={selectedObject}
            objectFields={objectFields}
            selectedFields={selectedFields}
            onFieldSelect={setSelectedFields}
            loadFields={(objectName) => loadFields(
              localStorage.getItem('sf_instance_url') || '',
              localStorage.getItem('sf_access_token') || '',
              objectName
            )}
          />
        ) : (
          <div className="text-center text-gray-500 py-4">
            Please select an object first
          </div>
        );

      case 'filters':
        return selectedObject ? (
          <FilterBuilder
            conditions={filterConditions}
            fields={objectFields}
            onConditionChange={setFilterConditions}
            filterLogic={filterLogic}
            onFilterLogicChange={setFilterLogic}
          />
        ) : (
          <div className="text-center text-gray-500 py-4">
            Please select an object first
          </div>
        );
    }
  };

  const generateSoqlPreview = () => {
    if (!selectedObject) return '';

    let soql = `SELECT ${selectedFields.join(',\n       ')}\nFROM ${selectedObject}`;
    
    if (filterConditions.length > 0) {
      if (filterLogic) {
        // Replace numbers with actual conditions in the filter logic
        let whereClause = filterLogic;
        filterConditions.forEach((condition, index) => {
          const conditionStr = `${condition.field} ${condition.operator} ${
            condition.operator === 'LIKE' 
              ? `'%${condition.value}%'`
              : condition.operator === 'IN' || condition.operator === 'NOT IN'
                ? `(${condition.value})`
                : `'${condition.value}'`
          }`;
          whereClause = whereClause.replace(
            new RegExp(`\\b${index + 1}\\b`), 
            `(${conditionStr})`
          );
        });
        soql += `\nWHERE ${whereClause}`;
      } else {
        // If no filter logic, join conditions with AND
        const whereClause = filterConditions
          .map(c => {
            const value = c.operator === 'LIKE' 
              ? `'%${c.value}%'`
              : c.operator === 'IN' || c.operator === 'NOT IN'
                ? `(${c.value})`
                : `'${c.value}'`;
            return `${c.field} ${c.operator} ${value}`;
          })
          .join(' AND ');
        soql += `\nWHERE ${whereClause}`;
      }
    }

    return soql;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[1000px] h-[800px] flex flex-col">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-900">
            {editingModel ? 'Edit Model' : 'Create New Model'}
          </h2>
        </div>

        <div className="border-b flex-shrink-0">
          <nav className="flex">
            {(['info', 'fields', 'filters'] as const).map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6" style={{ height: '500px' }}>
            {renderTabContent()}
          </div>

          <div className="border-t bg-gray-50 flex-shrink-0">
            <div 
              className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => setIsSqlPreviewOpen(!isSqlPreviewOpen)}
            >
              <span className="text-sm font-medium text-gray-700">SOQL Preview</span>
              <button className="text-gray-400 hover:text-gray-600">
                {isSqlPreviewOpen ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {isSqlPreviewOpen && (
              <div className="p-4 border-t border-gray-200">
                <pre 
                  className="bg-gray-100 p-3 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-700 overflow-y-auto"
                  style={{ height: '120px' }}
                >
                  {generateSoqlPreview() || 'No query generated yet'}
                </pre>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex justify-end space-x-2 bg-white flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingModel ? 'Save Changes' : 'Create Model'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelManagementModal; 