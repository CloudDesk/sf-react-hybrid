import React, { useEffect, useState } from "react";
import { Download, XCircle } from "lucide-react";
import axios from "axios";
import useFieldFetcher from "../../Hooks/useFieldFetcher";
import {
  fetchAndConvertFileToHtml,
  fetchRelatedFiles,
  fetchSalesforceObjects,
} from "../../services/salesforceService";
import CKEditorComponent from "../CKEditor";
import TemplateList from "../Common/ListItems/SearchableTemplateList";
import ErrorAlert from "../Common/Error/ErrorAlert";
import QueryGenerator from './QueryGenerator';
// import SalesforceMCEEditor from "../Common/TintMCEEditor/TinyMceEditor";

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
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Clear error after duration
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const { sObjects } = useFieldFetcher(instanceUrl, accessToken);

  // Transform sObjects into the correct format for Select component
  const formattedObjects = React.useMemo(() => {
    return sObjects.map(obj => ({
      value: obj,
      label: obj
    }));
  }, [sObjects]);
  console.log(formattedObjects, "formattedObjects")


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [filesResult] = await Promise.all([
          fetchRelatedFiles(instanceUrl, accessToken),
          fetchSalesforceObjects(instanceUrl, accessToken),
        ]);
        setFiles(filesResult);
      } catch (error: unknown) {
        console.error("Error fetching initial data:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [accessToken, instanceUrl]);


  const handleFileSelect = async (file: any) => {
    setSelectedTemplate(file);
    try {
      setLoading(true);
      setError(null); // Clear previous errors
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


  const handleDownloadAsDocx = async () => {
    try {
      setError(null); // Clear previous errors
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
      setError("Failed to convert the document. Please try again.");
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
      setError("Error formatting locale data. Please try again later.");
      throw error;
    }
  };
  formatLocaleData(new Date(), 234234234);

  return (


    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans antialiased">

      {/* Show error alert only when error exists */}
      {error && (
        <ErrorAlert
          message={error}
          type="error"
          duration={5000}
        />
      )}
      {/* Main Content Area with Elegant Grid */}
      <main className="flex-1  w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Template Sidebar with Refined Design */}
          <div className="col-span-2 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-xl border border-neutral-100 p-6">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">Templates</h3>
            <TemplateList
              templates={files}
              onTemplateSelect={handleFileSelect}
              selectedTemplate={selectedTemplate}
            />
            {accessToken && instanceUrl && (
              <QueryGenerator
                accessToken={accessToken}
                instanceUrl={instanceUrl}
              />
            )}
          </div>

          {/* Elegant Editor Section */}
          <div className="md:col-span-4">
            <div className="bg-white shadow-[0_8px_15px_-3px_rgba(0,0,0,0.08)] rounded-xl border border-neutral-100 overflow-hidden">
              {/* Editor Header */}
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-900 flex items-center space-x-3">
                  <span>Document Editor</span>
                  {selectedTemplate && (
                    <span className="text-sm text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full ml-3">
                      {selectedTemplate.title}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setEditorData("");
                    setSelectedTemplate(null);
                  }}
                  disabled={!editorData || loading}
                  className={`${editorData ? "opacity-100" : "invisible"}
                  inline-flex items-center px-3.5 py-2 border border-transparent 
                  text-sm leading-4 font-medium rounded-md 
                  text-rose-700 bg-rose-100/50 hover:bg-rose-100 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500
                  transition-all duration-300 ease-in-out
                  transform hover:scale-105`}
                >
                  <XCircle className="w-4 h-4 mr-2 opacity-70" />
                  Clear
                </button>
              </div>

              {/* Editor Content Area */}
              <div className="min-h-[500px] max-h-[700px] overflow-auto p-4">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 opacity-50"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <p className="text-neutral-600 font-medium">Preparing your document...</p>
                  </div>
                ) : (
                  <div className="">
                    <CKEditorComponent
                      editorContent={editorData}
                      onchange={(content) => setEditorData(content)}
                      instanceUrl={instanceUrl}
                      accessToken={accessToken}
                    />

                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4 justify-center">
          <button
            onClick={handleDownloadAsDocx}
            className="group relative inline-flex items-center px-5 py-2.5 
              border border-transparent text-sm font-medium rounded-lg 
              text-white bg-emerald-600 antialiased
              hover:bg-emerald-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-emerald-500 
              transition-all duration-300 ease-in-out 
              transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Download className="w-5 h-5 mr-2.5 opacity-80 group-hover:animate-pulse" />
            Export Document
          </button>
        </div>
      </main>

    </div>
  );
};

export default SalesforceFileViewer;
