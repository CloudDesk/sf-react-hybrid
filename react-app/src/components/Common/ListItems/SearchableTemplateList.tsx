import React, { useState } from "react";

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
  selectedTemplates?: Template[];
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onTemplateSelect,
  selectedTemplates = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.fileExtension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTemplateSelected = (templateId: string) =>
    selectedTemplates.some(
      (selectedTemplate) => selectedTemplate.id === templateId
    );

  return (
    <div>
      <div>
        <span className="inline-flex items-center gap-x-1.5 p-2 mb-4 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
          Click on the templates to select them
        </span>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            data-id={template.id}
            className={`rounded p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border border-gray-200 text-sm ${
              isTemplateSelected(template.id)
                ? "bg-blue-100 dark:bg-blue-500"
                : "bg-white"
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-700">
                {template.title}
              </span>
              <div className="text-xs text-gray-600">
                <span>File Type: {template.fileExtension}</span> |{" "}
                <span>Size: {(template.size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="text-xs text-gray-500">
                <span>
                  Created: {new Date(template.createdDate).toLocaleDateString()}
                </span>{" "}
                |{" "}
                <span>
                  Modified:{" "}
                  {new Date(template.lastModifiedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateList;
