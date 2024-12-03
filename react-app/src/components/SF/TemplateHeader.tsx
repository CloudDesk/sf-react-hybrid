import React from 'react';

interface TemplateHeaderProps {
  templateName: string;
  templateDescription: string;
  mode: 'basic' | 'advanced';
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onModeChange: (mode: 'basic' | 'advanced') => void;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  templateName,
  templateDescription,
  mode,
  onNameChange,
  onDescriptionChange,
  onModeChange,
}) => {
  return (
    <div className="bg-white border-b mb-4">
      {/* Main Header Content */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          {/* Template Name */}
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={templateName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter template name..."
            />
          </div>

          {/* Template Description */}
          <div>
            <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="templateDescription"
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={templateDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter template description..."
            />
          </div>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="border-t px-4 py-2 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Mode:</span>
          <div className="flex items-center bg-white rounded-lg p-1 border shadow-sm">
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mode === 'basic'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onModeChange('basic')}
            >
              Basic
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mode === 'advanced'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onModeChange('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateHeader; 