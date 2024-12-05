import React, { useState } from "react";
import { Search, FileText, X } from 'lucide-react';

export interface Template {
  id: string;
  title: string;
  fileExtension: string;
  size: number;
  createdDate: string;
  lastModifiedDate: string;
  versionId: string;
}

interface TemplateListProps {
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
  selectedTemplate?: Template | null;
  className?: string;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onTemplateSelect,
  selectedTemplate = null,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCompactView, setIsCompactView] = useState(false);

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.fileExtension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTemplateSelected = (templateId: string) =>
    selectedTemplate?.id === templateId;

  const determineView = (element: HTMLDivElement | null) => {
    if (element) {
      const width = element.offsetWidth;
      setIsCompactView(width < 400);
    }
  };

  return (
    <div
      ref={determineView}
      className={`w-full bg-white rounded-xl transition-all duration-300 ease-in-out ${className}`}
    >
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 
                   bg-gray-50 hover:bg-white transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200
                ${isTemplateSelected(template.id)
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                  : 'bg-white border-gray-100 hover:bg-gray-50'}
                border focus:outline-none group`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-1.5 rounded-lg
                  ${isTemplateSelected(template.id)
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-600">
                      {template.title}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                      {template.fileExtension}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {`Modified ${new Date(template.lastModifiedDate).toLocaleDateString()} • ${(template.size / 1024).toFixed(2)} KB`}
                  </div>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateList;