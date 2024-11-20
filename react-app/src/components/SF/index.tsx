import { useEffect, useState } from "react";
import CKEditorComponent from "../CKEditor";
import { Download, Maximize2, XCircle } from "lucide-react";
import axios from "axios";
import Accordion from "../Common/Accordion";
import Select from "../Common/Select/Select";
import SearchModal from "../Common/SearchModal";
import SearchableFieldList from "../Common/ListItems/SearchableFieldList";
import {
  fetchAndConvertFileToHtml,
  fetchObjectFields,
  fetchRelatedFiles,
  fetchSalesforceObjects,
} from "../../services/salesforceService";
import TemplateList from "../Common/ListItems/SearchableTemplateList";

interface SalesforceFileViewerProps {
  instanceUrl: string;
  accessToken: string;
}

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

export default function SalesforceFileViewer({
  instanceUrl,
  accessToken,
}: SalesforceFileViewerProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [sObjects, setSObjects] = useState<string[]>([]);
  const [fields, setFields] = useState<{ [key: string]: Field[] }>({});
  const [referenceFields, setReferenceFields] = useState<{
    [key: string]: Field[];
  }>({});
  const [selectedObject, setSelectedObject] = useState<string>("");
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);

  useEffect(() => {
    getAccountRelatedFiles();
    getSobjects();
  }, [accessToken, instanceUrl]);

  useEffect(() => {
    if (selectedObject) {
      getSobjectFields();
    }
  }, [selectedObject]);

  const getAccountRelatedFiles = async () => {
    try {
      setLoading(true);
      const result = await fetchRelatedFiles(instanceUrl, accessToken);
      setFiles(result);
    } catch (error) {
      console.error("Error fetching related files:", error);
      setError("Failed to load files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getSobjects = async () => {
    try {
      const response = await fetchSalesforceObjects(instanceUrl, accessToken);
      setSObjects(response.sobjects?.map((obj: any) => obj.name));
    } catch (error) {
      console.error("Error fetching sobjects:", error);
    }
  };

  const getSobjectFields = async () => {
    try {
      const fields = await fetchObjectFields(
        instanceUrl,
        accessToken,
        selectedObject
      );
      setFields((prevFields) => ({
        ...prevFields,
        [selectedObject]: fields,
      }));
      setReferenceFields(await fetchReferenceFields(fields));
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  const fetchReferenceFields = async (fields: Field[]) => {
    const referenceFieldPromises = fields
      .filter(
        (field) =>
          field.type === "reference" && (field.referenceTo?.length ?? 0) > 0
      )
      .map(async (field) => {
        try {
          const refObjectName = field.referenceTo![0];
          const refFields = await fetchObjectFields(
            instanceUrl,
            accessToken,
            refObjectName
          );
          return { [field.name]: refFields };
        } catch (error) {
          console.error(
            `Error fetching reference fields for ${field.name}:`,
            error
          );
          return { [field.name]: [] };
        }
      });

    const referenceFieldResults = await Promise.all(referenceFieldPromises);
    return Object.assign({}, ...referenceFieldResults);
  };

  const handleFileSelect = async (file: any) => {
    try {
      const htmlContent = await fetchAndConvertFileToHtml(
        instanceUrl,
        accessToken,
        file.versionId
      );
      setEditorData(htmlContent);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  const handleDownloadAsDocx = async () => {
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
  };

  const handleFieldSelection = (
    event: React.MouseEvent,
    field: Field,
    refName?: string
  ) => {
    event.stopPropagation();
    const relatedName = refName ? `${refName}.${field.name}` : field.name;
    const updatedField = {
      ...field,
      bindName: refName ? `{#${refName}}{${field.name}}{/}` : `{${field.name}}`,
      bindRelationshipName: refName,
      relatedName,
    };

    setSelectedFields((prevFields) => {
      const existingFieldIndex = prevFields.findIndex(
        (f) => f.relatedName === relatedName
      );
      if (existingFieldIndex !== -1) {
        return prevFields.filter((_, index) => index !== existingFieldIndex);
      }
      return [...prevFields, updatedField];
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1">
      {modalOpen && (
        <SearchModal
          onSelect={(field) => {
            setEditorData((prevData) =>
              prevData.replace(selectedWord || "", `{{${field}}}`)
            );
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
      <div className="flex flex-grow overflow-hidden">
        <div className="overflow-auto p-6 w-[45vw] max-h-screen bg-gray-50 border-r border-gray-200">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <Accordion title={"Templates"}>
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
                enableSearch={false}
              />
              <Accordion initiallyOpen={true} title="Fields">
                <SearchableFieldList
                  fields={fields[selectedObject] || []}
                  referenceFields={referenceFields}
                  onFieldSelect={handleFieldSelection}
                  selectedFields={selectedFields}
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
              <CKEditorComponent
                editorContent={editorData}
                onchange={(event: any, editor: any) =>
                  setEditorData(editor.getData())
                }
                onReady={(editor: any) => {
                  editor.editing.view.document.on("dblclick", (evt: any) => {
                    const selection = editor.model.document.selection;
                    const selectedText = selection.getSelectedText();
                    if (selectedText) {
                      setSelectedWord(selectedText);
                      setModalOpen(true);
                    }
                  });
                }}
              />
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
}
