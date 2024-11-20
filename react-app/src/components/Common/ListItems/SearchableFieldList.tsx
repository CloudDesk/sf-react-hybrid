import React, { useState } from "react";
import { ClipboardCopyIcon } from "lucide-react";
import Accordion from "../Accordion";

interface Field {
  name: string;
  label: string;
  type: string;
  relationshipName?: string;
  referenceTo?: string[];
  bindName?: string;
  bindRelationshipName?: string;
  relatedName?: string;
}

interface SearchableFieldListProps {
  fields: Field[];
  referenceFields: { [key: string]: Field[] };
  onFieldSelect: (
    event: React.MouseEvent,
    field: Field,
    refName?: string
  ) => void;
  selectedFields?: Field[];
}

const SearchableFieldList: React.FC<SearchableFieldListProps> = ({
  fields,
  referenceFields,
  onFieldSelect,
  selectedFields = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFields = fields.filter(
    (field) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFieldSelected = (fieldName: string, refName?: string) => {
    const relatedName = refName ? `${refName}.${fieldName}` : fieldName;
    return selectedFields.some(
      (selectedField) => selectedField.relatedName === relatedName
    );
  };

  const copyToClipboard = async (
    e: React.MouseEvent,
    field: Field,
    refName?: string
  ) => {
    e.stopPropagation();
    const textToCopy = refName
      ? `{#${refName}}{${field.name}}{/}`
      : `{${field.name}}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      console.log("Copied to clipboard:", textToCopy);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div>
      <div>
        <span className="inline-flex items-center gap-x-1.5 p-2 mb-4 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
          Click fields to select or copy their merge tags
        </span>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {filteredFields.map((field) =>
          field.type === "reference" ? (
            <Accordion
              key={field.name}
              title={
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {field.label}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({field.name})
                  </span>
                </div>
              }
            >
              <div className="p-2 bg-gray-50 rounded">
                {referenceFields[field.name] && (
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-1">
                      {referenceFields[field.name].map((refField) => (
                        <div
                          key={refField.name}
                          className={`rounded p-1 cursor-pointer hover:bg-blue-50 transition-colors duration-200 border border-gray-200 text-xs break-words ${
                            isFieldSelected(
                              refField.name,
                              field.relationshipName
                            )
                              ? "bg-blue-100"
                              : "bg-white"
                          }`}
                          onClick={(event) =>
                            onFieldSelect(
                              event,
                              refField,
                              field.relationshipName
                            )
                          }
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-700">
                                {refField.label}
                              </div>
                              <div className="text-gray-500">
                                {refField.name}
                              </div>
                            </div>
                            <ClipboardCopyIcon
                              className="cursor-pointer text-gray-500 hover:text-gray-700"
                              onClick={(e) =>
                                copyToClipboard(
                                  e,
                                  refField,
                                  field.relationshipName
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Accordion>
          ) : (
            <div
              key={field.name}
              className={`rounded p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border border-gray-200 text-sm ${
                isFieldSelected(field.name) ? "bg-blue-100" : "bg-white"
              }`}
              onClick={(event) => onFieldSelect(event, field)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-700">
                    {field.label}
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({field.name})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClipboardCopyIcon
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={(e) => copyToClipboard(e, field)}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchableFieldList;
