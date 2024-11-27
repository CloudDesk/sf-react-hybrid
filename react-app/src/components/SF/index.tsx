import React, { useEffect, useState } from "react";
import { Download, Maximize2, XCircle } from "lucide-react";
import axios from "axios";
import useFieldFetcher from "../../Hooks/useFieldFetcher";
import {
  fetchAndConvertFileToHtml,
  fetchOrgLocaleInfo,
  fetchRelatedFiles,
  fetchSalesforceObjects,
} from "../../services/salesforceService";
import CKEditorComponent from "../CKEditor";
import Accordion from "../Common/Accordion";
import Select from "../Common/Select/Select";
import SearchableFieldList from "../Common/ListItems/SearchableFieldList";
import PopoverFieldSelector from "../Common/PopoverFieldSelector";
import TemplateList from "../Common/ListItems/SearchableTemplateList";
import { Spinner } from "../Common/Loaders/Spinner";
import ConditionalDialog from "../ConditionalDialog";
import nunjucks from "nunjucks";

interface SalesforceFileViewerProps {
  instanceUrl: string;
  accessToken: string;
  localeInfo: any;
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

interface OrgInfo {
  attributes: {
    type: string;
    url: string;
  };
  DefaultLocaleSidKey: string;
  LanguageLocaleKey: string;
  Name: string;
  OrganizationType: string;
  Country: string;
  FiscalYearStartMonth: number;
}

const SalesforceFileViewer: React.FC<SalesforceFileViewerProps> = ({
  instanceUrl,
  accessToken,
  localeInfo,
}) => {
  console.log(localeInfo, "localeInfo from SalesforceFileViewer");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string>("");
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [popoverPosition, setPopoverPosition] = useState<Position | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [showConditionalDialog, setShowConditionalDialog] = useState(false);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [bindButtonPosition, setBindButtonPosition] = useState<Position | null>(
    null
  );

  const { sObjects, fields, referenceFields, fetchFields, isFieldLoading } =
    useFieldFetcher(instanceUrl, accessToken);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [filesResult] = await Promise.all([
          fetchRelatedFiles(instanceUrl, accessToken),
          fetchSalesforceObjects(instanceUrl, accessToken),
        ]);
        setFiles(filesResult);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [accessToken, instanceUrl]);

  useEffect(() => {
    if (selectedObject) {
      fetchFields(selectedObject);
    }
  }, [selectedObject, fetchFields]);

  useEffect(() => {
    if (editorData === "") {
      setSelectedWord("");
    }
  }, [editorData]);

  const handleFileSelect = async (file: any) => {
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
  };

  const handleEditorReady = ({
    editor,
    selectedText,
    position,
    range,
  }: {
    editor: any;
    selectedText: string;
    position: Position;
    range?: any;
  }) => {
    setEditorInstance(editor);
    setSelectedWord(selectedText);
    setSelectedRange(range);
    setBindButtonPosition(position);
  };

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

  const handleBindClick = (event: React.MouseEvent) => {
    if (bindButtonPosition) {
      setPopoverPosition({
        x: bindButtonPosition.x,
        y: bindButtonPosition.y + 40,
      });
    }
  };

  const handleConditionalLogic = (condition: string) => {
    if (editorInstance && selectedRange) {
      editorInstance.model.change((writer: any) => {
        const selection = editorInstance.model.createSelection(selectedRange);
        const selectedContent =
          editorInstance.model.getSelectedContent(selection);

        const startTag = writer.createText(`{#${condition}}`);
        const endTag = writer.createText("{/}");

        const documentFragment = writer.createDocumentFragment();
        writer.append(startTag, documentFragment);
        writer.append(selectedContent, documentFragment);
        writer.append(endTag, documentFragment);

        editorInstance.model.deleteContent(selection);
        editorInstance.model.insertContent(
          documentFragment,
          selectedRange.start
        );
      });
    }
    setShowConditionalDialog(false);
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

  const countryToCurrencyMap = {
    US: "USD",
    GB: "GBP",
    FR: "EUR",
    DE: "EUR",
    CA: "CAD",
    AU: "AUD",
    IN: "INR",
    // Add more countries as needed
  };

  // Function to format date based on Salesforce locale
  const formatDate = (date: Date, locale: string): string => {
    return new Intl.DateTimeFormat(locale).format(date);
  };

  // Function to format currency based on Salesforce locale and currency
  const formatCurrency = (
    amount: number,
    locale: string,
    currency: string
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Fetching locale info from Salesforce and formatting accordingly
  const formatLocaleData = async (date: Date, amount: number) => {
    try {
      // Fetching organization locale information
      const orgInfo = localeInfo;

      // Convert 'en_US' to 'en-US'
      const locale =
        (orgInfo as OrgInfo).DefaultLocaleSidKey.replace("_", "-") || "de-DE"; // Default to 'en-US' if unavailable

      // Map Country to Currency Code (like 'US' to 'USD')
      const country = (orgInfo as OrgInfo).Country || "GB"; // Default to 'US' if unavailable
      const currency =
        countryToCurrencyMap[country as keyof typeof countryToCurrencyMap] ||
        "USD"; // Default to 'USD' if mapping is unavailable

      // Format date and currency based on the locale
      const formattedDate = formatDate(date, locale);
      const formattedCurrency = formatCurrency(amount, locale, currency);

      console.log(formattedDate, formattedCurrency);
      // Return formatted data
      return {
        formattedDate,
        formattedCurrency,
      };
    } catch (error) {
      console.error("Error formatting locale data:", error);
      throw error;
    }
  };
  formatLocaleData(new Date(), 234234234);

  return (
    <div className="grid grid-cols-1">
      {popoverPosition && (
        <PopoverFieldSelector
          fields={fields[selectedObject] || []}
          referenceFields={referenceFields[selectedObject] || {}}
          position={popoverPosition}
          onFieldSelect={handleFieldSelect}
          onClose={() => setPopoverPosition(null)}
          onAddCondition={() => {
            setShowConditionalDialog(true);
            setPopoverPosition(null);
          }}
        />
      )}

      {showConditionalDialog && (
        <ConditionalDialog
          fields={fields[selectedObject] || []}
          onApply={handleConditionalLogic}
          onClose={() => setShowConditionalDialog(false)}
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
              <Accordion initiallyOpen={false} title="Fields">
                <SearchableFieldList
                  fields={fields[selectedObject] || []}
                  referenceFields={referenceFields[selectedObject] || {}}
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
                  onClick={() => {
                    setEditorData("");
                  }}
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
              <div className="px-6 pb-4">
                {selectedWord && bindButtonPosition && (
                  <button
                    onClick={handleBindClick}
                    className="px-5 py-2.5 font-medium bg-blue-200 hover:bg-blue-100 hover:text-blue-600 text-blue-500 rounded-lg text-sm"
                  >
                    Bind
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 bg-white">
              {loading ? (
                <Spinner size="lg" color="text-blue-500" />
              ) : (
                <CKEditorComponent
                  editorContent={editorData}
                  onchange={(content) => setEditorData(content)}
                  onReady={handleEditorReady}
                  fields={fields[selectedObject] || []}
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
