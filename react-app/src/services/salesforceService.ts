import axios from "axios";
import { convertDocxToHtml } from "../util/docxToHtml";

// interface ConversionResponse {
//   success: boolean;
//   html: string;
//   message?: string;
//   error?: string;
// }

const fetchSalesforceObjects = async (
  instanceUrl: string,
  accessToken: string
) => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v54.0/sobjects`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Salesforce objects:", error);
    throw error;
  }
};

const fetchObjectFields = async (
  instanceUrl: string,
  accessToken: string,
  objectName: string
) => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v54.0/sobjects/${objectName}/describe`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.fields;
  } catch (error) {
    console.error(`Error fetching fields for object ${objectName}:`, error);
    throw error;
  }
};

const fetchChildRelationships = async (
  instanceUrl: string,
  accessToken: string,
  objectName: string
) => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v54.0/sobjects/${objectName}/describe`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.childRelationships;
  } catch (error) {
    console.error(
      `Error fetching child relationships for object ${objectName}:`,
      error
    );
    throw error;
  }
};

const fetchRelatedFiles = async (
  instanceUrl: string,
  accessToken: string,
  objectName?: string // Optional: ID of the specific custom object
) => {
  try {
    // Step 1: Fetch all Document_Template__c records or a specific one if objectName is provided
    const templateQuery = objectName
      ? `SELECT Id FROM Document_Template__c WHERE Name = '${objectName}'`
      : `SELECT Id FROM Document_Template__c`;

    const templateQueryUrl = `${instanceUrl}/services/data/v54.0/query?q=${encodeURIComponent(
      templateQuery
    )}`;
    const templateResponse = await axios.get(templateQueryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Extract the list of template IDs
    const templateIds = templateResponse.data.records.map(
      (record: any) => record.Id
    );

    if (templateIds.length === 0) {
      console.warn("No templates found.");
      return [];
    }

    // Step 2: Query related files for the retrieved templates
    const fileQuery = `
            SELECT 
    ContentDocumentId,
    ContentDocument.Title,
    ContentDocument.FileExtension,
    ContentDocument.LatestPublishedVersionId,
    ContentDocument.FileType,
    ContentDocument.Description,
    ContentDocument.CreatedDate,
    ContentDocument.LastModifiedDate,
    ContentDocument.Owner.Name,
    ContentDocument.ContentSize,
    LinkedEntityId,
    ShareType,
    Visibility,
    IsDeleted
FROM ContentDocumentLink 
WHERE LinkedEntityId IN (${templateIds.map((id: any) => `'${id}'`).join(", ")})
ORDER BY ContentDocument.LastModifiedDate DESC`;

    const fileQueryUrl = `${instanceUrl}/services/data/v54.0/query?q=${encodeURIComponent(
      fileQuery
    )}`;
    const fileResponse = await axios.get(fileQueryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Map and return the related files data
    return fileResponse.data.records.map((record: any) => ({
      id: record.ContentDocumentId,
      title: record.ContentDocument.Title,
      fileExtension: record.ContentDocument.FileExtension,
      versionId: record.ContentDocument.LatestPublishedVersionId,
      createdDate: record.ContentDocument.CreatedDate,
      lastModifiedDate: record.ContentDocument.LastModifiedDate,
      size: record.ContentDocument.ContentSize,
    }));
  } catch (error) {
    console.error("Error fetching related files:", error);
    throw error;
  }
};

const fetchAndConvertFileToHtml = async (
  instanceUrl: string,
  accessToken: string,
  fileVersionId: string // The LatestPublishedVersionId for the file
): Promise<string> => {
  try {
    // Step 1: Download the file as an ArrayBuffer
    const downloadUrl = `${instanceUrl}/services/data/v54.0/sobjects/ContentVersion/${fileVersionId}/VersionData`;
    console.log(downloadUrl, "downloadUrl");
    const fileResponse = await axios.get(downloadUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer", // Fetch the file content as an ArrayBuffer
    });
    console.log(fileResponse, "fileResponse");
    const fileBuffer = new Uint8Array(fileResponse.data);
    console.log(fileBuffer, "fileBuffer");



    // Step 2: Convert the buffer to HTML using Mammoth (for .docx files)
    const mammothResult = await convertDocxToHtml(fileBuffer);
    console.log(mammothResult, "mammothResult");

    // Step 3: Return the HTML content
    return mammothResult;
  } catch (error) {
    console.error("Error fetching or converting file:", error);
    throw error;
  }
};


// const fetchAndConvertFileToHtml = async (
//   instanceUrl: string,
//   accessToken: string,
//   fileVersionId: string
// ): Promise<string> => {
//   try {
//     // Step 1: Download the file from Salesforce
//     const downloadUrl = `${instanceUrl}/services/data/v54.0/sobjects/ContentVersion/${fileVersionId}/VersionData`;
//     console.log('Downloading file from:', downloadUrl);

//     const fileResponse = await axios.get(downloadUrl, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//       responseType: 'arraybuffer',
//     });

//     // Convert ArrayBuffer to Uint8Array
//     const fileBuffer = new Uint8Array(fileResponse.data);
//     console.log('File downloaded, size:', fileBuffer.length, 'bytes');

//     // Step 2: Convert file to HTML
//     const response = await axios.post<ConversionResponse>(
//       'http://localhost:3600/convert-docx-to-html',
//       {
//         fileBuffer: JSON.stringify(Array.from(fileBuffer)), // Convert Uint8Array to regular array for JSON
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         // Add timeout and max content length configurations
//         timeout: 30000, // 30 seconds
//         maxContentLength: 50 * 1024 * 1024, // 50MB
//       }
//     );

//     // Check if conversion was successful
//     if (!response.data.success) {
//       throw new Error(response.data.message || 'Conversion failed');
//     }

//     console.log('File successfully converted to HTML');
//     return response.data.html;

//   } catch (error) {
//     // Improved error handling
//     if (axios.isAxiosError(error)) {
//       if (error.code === 'ECONNREFUSED') {
//         throw new Error('Could not connect to conversion service. Please ensure the service is running.');
//       }
//       if (error.response?.status === 413) {
//         throw new Error('File size too large. Maximum size is 50MB.');
//       }
//       throw new Error(`Conversion service error: ${error.response?.data?.message || error.message}`);
//     }

//     throw new Error(`File conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// };

const fetchOrgLocaleInfo = async (
  instanceUrl: string,
  accessToken: string
): Promise<object> => {
  try {
    const query = `
    SELECT
      DefaultLocaleSidKey,
      LanguageLocaleKey,
      Name,
      OrganizationType,
      Country,
      FiscalYearStartMonth
    FROM Organization
    LIMIT 1
  `;

    const response = await axios.get(
      `${instanceUrl}/services/data/v54.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.records && response.data.records.length > 0) {
      return response.data.records[0]; // Return the first (and only) organization record
    }

    throw new Error("No organization locale information found.");
  } catch (error) {
    console.error("Error fetching organization locale information:", error);
    throw error;
  }
};

export {
  fetchSalesforceObjects,
  fetchObjectFields,
  fetchChildRelationships,
  fetchRelatedFiles,
  fetchAndConvertFileToHtml,
  fetchOrgLocaleInfo,
};
