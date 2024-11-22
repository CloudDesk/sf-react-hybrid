import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Download, Maximize2, XCircle } from "lucide-react";
import axios from "axios";

// Custom Hooks and Services
import useFieldFetcher from "../../Hooks/useFieldFetcher";
import {
  fetchAndConvertFileToHtml,
  fetchRelatedFiles,
  fetchSalesforceObjects,
} from "../../services/salesforceService";

// Component Imports
import CKEditorComponent from "../CKEditor";
import Accordion from "../Common/Accordion";
import Select from "../Common/Select/Select";
import SearchableFieldList from "../Common/ListItems/SearchableFieldList";
import PopoverFieldSelector from "../Common/PopoverFieldSelector";
import TemplateList from "../Common/ListItems/SearchableTemplateList";
import { Spinner } from "../Common/Loaders/Spinner";

// Type Definitions
interface SalesforceFileViewerProps {
  instanceUrl: string;
  accessToken: string;
}

export interface Field {
  name: string;
  label: string;
  type: string;
  relationshipName?: string;
  referenceTo?: string[];
  bindName?: string;
}

interface Position {
  x: number;
  y: number;
}

const SalesforceFileViewer: React.FC<SalesforceFileViewerProps> = ({
  instanceUrl,
  accessToken,
}) => {
  // State Management
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string>("");
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [popoverPosition, setPopoverPosition] = useState<Position | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Custom Hook for Field Management
  const { sObjects, fields, referenceFields, fetchFields, isFieldLoading } =
    useFieldFetcher(instanceUrl, accessToken);

  // Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [filesResult, objectsResult] = await Promise.all([
          fetchRelatedFiles(instanceUrl, accessToken),
          fetchSalesforceObjects(instanceUrl, accessToken),
        ]);

        setFiles(filesResult);
        // Assuming the response has a sobjects property
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [accessToken, instanceUrl]);

  // Field Fetching Effect
  useEffect(() => {
    if (selectedObject) {
      fetchFields(selectedObject);
    }
  }, [selectedObject, fetchFields]);

  // File Selection Handler
  const handleFileSelect = useCallback(
    async (file: any) => {
      try {
        setLoading(true);
        const htmlContent = await fetchAndConvertFileToHtml(
          instanceUrl,
          accessToken,
          file.versionId
        );
        setEditorData(htmlContent);
      } catch (error) {
        console.error("Error fetching file content:", error);
        setError("Failed to load file content. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [instanceUrl, accessToken]
  );

  // Editor Ready Handler
  const handleEditorReady = useCallback(
    ({
      editor,
      selectedText,
      position,
    }: {
      editor: any;
      selectedText: string;
      position: Position;
    }) => {
      setEditorInstance(editor);
      setSelectedWord(selectedText);
      setPopoverPosition(position);
    },
    []
  );

  // Field Selection Handler
  const handleFieldSelect = (field: Field, refFieldName?: string) => {
    if (editorInstance && selectedWord) {
      let bindName;
      if (refFieldName) {
        const referenceField = fields[selectedObject].find(
          (f) => f.name === refFieldName
        );
        if (referenceField?.relationshipName) {
          bindName = `{#${referenceField.relationshipName}}{${field.name}}{/}`;
        }
      } else {
        bindName = `{${field.name}}`;
      }

      if (bindName) {
        editorInstance.model.change((writer: any) => {
          const selection = editorInstance.model.document.selection;
          const range = selection.getFirstRange();

          if (range) {
            editorInstance.model.deleteContent(selection);
            const position = range.start;
            const insertText = writer.createText(bindName);
            editorInstance.model.insertContent(insertText, position);
          }
        });
      }
      setPopoverPosition(null);
    }
  };

  // Download as DOCX Handler
  const handleDownloadAsDocx = useCallback(async () => {
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}convert-to-docx`,
        editorData,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );

      const blob = new Blob([result.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "document.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Failed to convert the document. Please try again.");
    }
  }, [editorData]);

  // Memoized Current Fields
  const currentFields = useMemo(
    () => fields[selectedObject] || [],
    [fields, selectedObject]
  );

  const currentReferenceFields = useMemo(
    () => referenceFields[selectedObject] || {},
    [referenceFields, selectedObject]
  );

  // if (error) {
  //   return <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>;
  // }
  console.log(editorData, "editorData");
  return (
    <div className="grid grid-cols-1">
      {popoverPosition && (
        <PopoverFieldSelector
          fields={currentFields}
          referenceFields={referenceFields[selectedObject] || {}}
          position={popoverPosition}
          onFieldSelect={handleFieldSelect}
          onClose={() => setPopoverPosition(null)}
        />
      )}
      <div className="flex flex-grow overflow-hidden">
        <div className="overflow-auto p-6 w-[45vw] max-h-screen bg-gray-50 border-r border-gray-200">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <Accordion initiallyOpen={true} title="Templates">
                <TemplateList
                  templates={files}
                  onTemplateSelect={handleFileSelect}
                />
              </Accordion>
              <Select
                label="Select Object"
                value={selectedObject}
                options={sObjects}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedObject(e.target.value)
                }
                enableSearch={true}
              />
              <Accordion initiallyOpen={true} title="Fields">
                <SearchableFieldList
                  fields={currentFields}
                  referenceFields={currentReferenceFields}
                  onFieldSelect={(event, field) => {
                    event.preventDefault();
                    handleFieldSelect(field);
                  }}
                  selectedFields={[]}
                  isLoading={isFieldLoading}
                />
              </Accordion>
            </div>
          </div>
        </div>
        <div
          className={`${
            isExpanded ? "w-full" : "w-1/2"
          } transition-all duration-500 ease-in-out flex flex-col absolute right-0 top-0 bottom-0 bg-white shadow-xl rounded-l-xl overflow-hidden`}
        >
          <div className="flex-grow overflow-auto">
            <div className="bg-white border-b border-gray-300">
              <div className="flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => setEditorData("")}
                  className={`${
                    editorData ? "opacity-100" : "invisible"
                  } flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200`}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Editor</h2>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-800 hover:text-gray-600 text-base font-medium group relative"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 bg-white">
              {loading ? (
                <Spinner
                  size="lg"
                  color="text-blue-500"
                  className="my-custom-class"
                />
              ) : (
                <CKEditorComponent
                  editorContent={editorData}
                  onchange={(content) => setEditorData(content)}
                  onReady={handleEditorReady}
                  fields={currentFields}
                />
              )}
            </div>
          </div>
          <div className="p-4 bg-gray-100 border-t border-gray-300">
            <button
              onClick={handleDownloadAsDocx}
              className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2" />
              Download as DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesforceFileViewer;
