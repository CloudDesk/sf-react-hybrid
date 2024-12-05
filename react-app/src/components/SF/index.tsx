import React, { useEffect, useState } from "react";
import { Download, XCircle, FolderOpen } from "lucide-react";
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
import SalesforceMCEEditor from "../Common/TintMCEEditor/TinyMceEditor";

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
  const [error, setError] = useState<any | null>(null);
  const [editorData, setEditorData] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);


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
      throw error;
    }
  };
  formatLocaleData(new Date(), 234234234);

  return (
    // <div className="h-screen flex bg-gray-50">
    //   {/* Left Sidebar - Templates */}
    //   <div className="w-[300px] flex flex-col bg-white border-r border-gray-200">
    //     {/* Search Header */}
    //     <div className="p-4 border-b border-gray-200">
    //       <div className="relative">
    //         <input
    //           type="text"
    //           placeholder="Search templates..."
    //           className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg 
    //                    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
    //                    bg-gray-50 hover:bg-white transition-colors duration-200"
    //         />
    //         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    //       </div>
    //     </div>

    //     {/* Templates List */}
    //     <div className="flex-1 overflow-auto">
    //       <div className="p-4">
    //         <h2 className="text-sm font-semibold text-gray-900 mb-3">Templates</h2>
    //         <div className="space-y-2">
    //           {files.map((file: any) => (
    //             <button
    //               key={file.id}
    //               onClick={() => handleFileSelect(file)}
    //               className="w-full text-left p-3 rounded-lg hover:bg-gray-50 
    //                        transition-all duration-200 group focus:outline-none
    //                        border border-gray-100 hover:border-gray-200"
    //             >
    //               <div className="flex items-start">
    //                 <div className="flex-shrink-0 mt-1">
    //                   <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
    //                 </div>
    //                 <div className="ml-3">
    //                   <div className="text-sm font-medium text-gray-900">{file.name}</div>
    //                   <div className="text-xs text-gray-500 mt-0.5">
    //                     {`docx • ${file.size} KB`}
    //                   </div>
    //                   <div className="text-xs text-gray-400 mt-1">
    //                     {`Modified ${file.modifiedDate}`}
    //                   </div>
    //                 </div>
    //               </div>
    //             </button>
    //           ))}
    //         </div>
    //       </div>
    //     </div>

    //     {/* New Template Button */}
    //     <div className="p-4 border-t border-gray-200">
    //       <button
    //         className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium
    //                  bg-blue-600 text-white rounded-lg hover:bg-blue-700 
    //                  transition-all duration-200 transform hover:scale-[1.02]
    //                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //       >
    //         <Plus className="w-4 h-4 mr-2" />
    //         New Template
    //       </button>
    //     </div>
    //   </div>

    //   {/* Main Editor Area */}
    //   <div className="flex-1 flex flex-col">
    //     {/* Editor Header */}
    //     <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200">
    //       <div className="flex items-center space-x-4">
    //         <button
    //           onClick={() => setEditorData("")}
    //           className={`${editorData ? "opacity-100" : "invisible"}
    //                    px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md 
    //                    hover:bg-red-100 transition-colors duration-200
    //                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
    //         >
    //           <div className="flex items-center">
    //             <XCircle className="w-4 h-4 mr-1.5" />
    //             <span>Clear</span>
    //           </div>
    //         </button>
    //         <h2 className="text-lg font-semibold text-gray-900">Editor</h2>
    //       </div>
    //       <div className="flex items-center space-x-2">
    //         <button
    //           onClick={() => setIsExpanded(!isExpanded)}
    //           className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 
    //                    rounded-md transition-colors duration-200"
    //         >
    //           <Maximize2 className="w-4 h-4" />
    //         </button>
    //       </div>
    //     </div>

    //     {/* Editor Content */}
    //     <div className="flex-1 overflow-hidden">
    //       <div className="h-full w-full bg-white rounded-lg ">
    //         {loading ? (
    //           <div className="h-full flex items-center justify-center">
    //             <div className="text-center">
    //               <Spinner size="lg" color="text-blue-500" />
    //               <div className="mt-4 text-sm text-gray-500">Loading content...</div>
    //             </div>
    //           </div>
    //         ) : (
    //           <CKEditorComponent
    //             editorContent={editorData}
    //             onchange={(content) => setEditorData(content)}
    //             instanceUrl={instanceUrl}
    //             accessToken={accessToken}
    //           />
    //         )}
    //       </div>
    //     </div>

    //     {/* Editor Footer */}
    //     <div className="h-16 flex items-center justify-center px-6 bg-white border-t border-gray-200">
    //       <button
    //         onClick={handleDownloadAsDocx}
    //         className="flex items-center px-6 py-2.5 text-sm font-medium text-white 
    //                  bg-blue-600 rounded-lg hover:bg-blue-700 
    //                  transition-all duration-200 transform hover:scale-[1.02]
    //                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //       >
    //         <Download className="w-4 h-4 mr-2" />
    //         Download as DOCX
    //       </button>
    //     </div>
    //   </div>
    // </div>

    // <div className="min-h-screen flex flex-col bg-gray-50">
    //   {/* Enhanced Header with more visual hierarchy */}
    //   <header className="bg-white shadow-md border-b border-gray-100">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    //       <div className="flex items-center space-x-4">
    //         <FolderOpen className="w-7 h-7 text-blue-600 drop-shadow-sm" />
    //         <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
    //           Document Editor
    //         </h1>
    //       </div>
    //       <div className="flex items-center space-x-4">
    //         <button
    //           onClick={handleDownloadAsDocx}
    //           className="group inline-flex items-center px-4 py-2 border border-transparent 
    //         text-sm font-medium rounded-md text-white bg-blue-600 
    //         hover:bg-blue-700 focus:outline-none focus:ring-2 
    //         focus:ring-offset-2 focus:ring-blue-500 
    //         transition-all duration-300 ease-in-out 
    //         transform hover:-translate-y-0.5 hover:scale-105"
    //         >
    //           <Download className="w-5 h-5 mr-2 group-hover:animate-pulse" />
    //           Download as DOCX
    //         </button>
    //       </div>
    //     </div>
    //   </header>

    //   {/* Main content with improved layout and responsiveness */}
    //   <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    //       {/* Templates list with hover effects */}
    //       <div className="col-span-1">
    //         <TemplateList templates={files} onTemplateSelect={handleFileSelect} />
    //       </div>

    //       {/* Editor with enhanced visual design */}
    //       <div className="md:col-span-3">
    //         <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
    //           {/* Editor Header with subtle animations */}
    //           <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
    //             <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
    //               <span>Editor</span>
    //               {selectedTemplate && (
    //                 <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full ml-3">
    //                   {selectedTemplate.name}
    //                 </span>
    //               )}
    //             </h2>
    //             <button
    //               onClick={() => setEditorData("")}
    //               className={`${editorData ? "opacity-100" : "invisible"}
    //               inline-flex items-center px-3 py-2 border border-transparent 
    //               text-sm leading-4 font-medium rounded-md 
    //               text-red-700 bg-red-100 hover:bg-red-200 
    //               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    //               transition-all duration-300 ease-in-out
    //               transform hover:scale-105`}
    //             >
    //               <XCircle className="w-4 h-4 mr-2" />
    //               Clear
    //             </button>
    //           </div>

    //           {/* Editor Content with loading state */}
    //           <div className="min-h-[500px] max-h-[700px] overflow-auto">
    //             {loading ? (
    //               <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
    //                 <div className="relative">
    //                   <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    //                   <div className="absolute inset-0 flex items-center justify-center">
    //                     <div className="w-8 h-8 bg-white rounded-full"></div>
    //                   </div>
    //                 </div>
    //                 <p className="text-gray-600 font-medium">Loading content...</p>
    //               </div>
    //             ) : (
    //               // Your CKEditorComponent would go here
    //               <div className="p-6">
    //                 <CKEditorComponent
    //                   editorContent={editorData}
    //                   onchange={(content) => setEditorData(content)}
    //                   instanceUrl={instanceUrl}
    //                   accessToken={accessToken}
    //                 />
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </main>
    // </div>

    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans antialiased">

      {/* Error Message */}
      {error && <ErrorAlert message={error} type="error" duration={5000} />}
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
