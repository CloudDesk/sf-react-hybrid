import React, { useState } from 'react';
import { useSalesforce } from '../../../../contexts/SalesforceContext';
import ModelManagementModal from './ModelManagementModal';

interface Model {
  name: string;
  developerName: string;
  description: string;
  object: string;
  fields: string[];
}

export const ModelsTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  const handleCreateModel = (model: Model) => {
    if (editingModel) {
      setModels(prev => prev.map(m => 
        m.developerName === editingModel.developerName ? model : m
      ));
      setEditingModel(null);
    } else {
      setModels(prev => [...prev, model]);
    }
    setIsModalOpen(false);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with New Model button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Models</h3>
          <p className="text-sm text-gray-500">Create and manage your data models</p>
        </div>
        <button
          onClick={() => {
            setEditingModel(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Model
        </button>
      </div>

      {/* Models List */}
      <div className="space-y-2">
        {models.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No models</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new model</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingModel(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Model
              </button>
            </div>
          </div>
        ) : (
          models.map((model) => (
            <div
              key={model.developerName}
              className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEditModel(model)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{model.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {model.object}
                    </span>
                    <span className="text-xs text-gray-500">
                      {model.fields.length} fields
                    </span>
                  </div>
                </div>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditModel(model);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Model Management Modal */}
      <ModelManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingModel(null);
        }}
        onCreate={handleCreateModel}
        editingModel={editingModel}
      />
    </div>
  );
};

export default ModelsTab; 