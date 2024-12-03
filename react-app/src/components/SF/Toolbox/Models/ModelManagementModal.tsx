import React, { useState, useEffect } from 'react';
import { useSalesforce } from '../../../../contexts/SalesforceContext';
import { Field } from '../../../CKEditor/types';
import AdvancedFieldSelection from './AdvancedFieldSelection';
import FilterBuilder from './FilterBuilder';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            {editingModel ? 'Edit Model' : 'Create New Model'}
          </h2>
        </div>

        <div className="p-4 space-y-4">
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
              onChange={(e) => setSelectedObject(e.target.value)}
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

          {selectedObject && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fields</label>
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
              </div>

              <div>
                <FilterBuilder
                  conditions={filterConditions}
                  fields={objectFields}
                  onConditionChange={setFilterConditions}
                  filterLogic={filterLogic}
                  onFilterLogicChange={setFilterLogic}
                />
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
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
  );
};

export default ModelManagementModal; 