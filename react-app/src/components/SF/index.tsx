import { useEffect, useState } from 'react';
import { fetchAndConvertFileToHtml, fetchRelatedFiles } from '../../services/salesforceService';
import FileList from './FileList';
import { SalesforceFile } from './types/FileTypes';
import { CKEditorComponent } from '../CKEditor';

interface SalesforceFileViewerProps {
  instanceUrl: string;
  accessToken: string;
  handleLogout: () => void;
}

export default function SalesforceFileViewer({
  instanceUrl,
  accessToken,
  handleLogout
}: SalesforceFileViewerProps) {
  const [files, setFiles] = useState<SalesforceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string | null>('')

  useEffect(() => {
    getAccountRelatedFiles();
  }, []);

  const getAccountRelatedFiles = async () => {
    try {
      setLoading(true);
      const result = await fetchRelatedFiles(instanceUrl, accessToken);
      setFiles(result);
    } catch (error) {
      console.error('Error fetching related files:', error);
      setError('Failed to load files. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: SalesforceFile) => {
    console.log('Selected file:', file);
    // Handle file selection logic here
    const htmlContent = await fetchAndConvertFileToHtml(instanceUrl, accessToken, file.versionId)
    console.log(htmlContent);
    setSelectedFiles(htmlContent)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 w-full">
      <div className='container-1 basis-1/3  p-4 flex flex-col h-screen'>
        <div className="container-1" style={{ flex: "0 0 35%" }}>
          <FileList files={files} onFileSelect={handleFileSelect} />
        </div>
        <div className="container-2 " style={{ flex: "0 0 40%" }}>
          <p>Content 2</p>
        </div>
        <div className="container-3 " style={{ flex: "0 0 15%" }}>
          <button
            onClick={handleLogout}
            className="mt-4 px-5 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out">
            Disconnect from Salesforce
          </button>
        </div>
      </div>
      <div className='container-2 basis-2/3'>
        <CKEditorComponent selectedFile={selectedFiles} />
      </div>
    </div>
  );
}