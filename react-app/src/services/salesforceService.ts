import axios from "axios";
import mammoth from "mammoth";

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

    const fileResponse = await axios.get(downloadUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer", // Fetch the file content as an ArrayBuffer
    });

    const fileBuffer = new Uint8Array(fileResponse.data);
    console.log(fileBuffer, "fileBuffer");

    // Step 2: Convert the buffer to HTML using Mammoth (for .docx files)
    const mammothResult = await mammoth.convertToHtml({
      arrayBuffer: fileBuffer,
    });
    console.log(mammothResult, "mammothResult");

    // Step 3: Return the HTML content
    return mammothResult.value;
  } catch (error) {
    console.error("Error fetching or converting file:", error);
    throw error;
  }
};

export {
  fetchSalesforceObjects,
  fetchObjectFields,
  fetchChildRelationships,
  fetchRelatedFiles,
  fetchAndConvertFileToHtml,
};
