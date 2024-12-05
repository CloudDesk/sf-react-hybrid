import { useState, useCallback, useEffect } from "react";
import {
  fetchObjectFields,
  fetchSalesforceObjects,
} from "../services/salesforceService";

import { Field } from "../components/SF/index";

// Global cache for objects and fields
const globalCache = {
  objects: [] as string[],
  fields: {} as { [key: string]: Field[] },
  referenceFields: {} as { [key: string]: { [key: string]: Field[] } },
  objectsFetched: false
};

interface FieldFetcherResult {
  sObjects: string[];
  fields: { [key: string]: Field[] };
  referenceFields: { [key: string]: { [key: string]: Field[] } };
  fetchFields: (objectName: string) => Promise<void>;
  isFieldLoading: boolean;
}

const useFieldFetcher = (
  instanceUrl: string,
  accessToken: string
): FieldFetcherResult => {
  const [sObjects, setSObjects] = useState<string[]>(globalCache.objects);
  const [fields, setFields] = useState<{ [key: string]: Field[] }>(globalCache.fields);
  const [referenceFields, setReferenceFields] = useState<{
    [key: string]: { [key: string]: Field[] };
  }>(globalCache.referenceFields);
  const [isFieldLoading, setIsFieldLoading] = useState(false);

  // Fetch Salesforce Objects only once globally
  useEffect(() => {
    const fetchObjects = async () => {
      if (globalCache.objectsFetched) {
        setSObjects(globalCache.objects);
        return;
      }

      try {
        const response = await fetchSalesforceObjects(instanceUrl, accessToken);
        const fetchedObjects = response.sobjects?.map((obj: any) => obj.name) || [];
        globalCache.objects = fetchedObjects;
        globalCache.objectsFetched = true;
        setSObjects(fetchedObjects);
      } catch (error) {
        console.error("Error fetching Salesforce objects:", error);
      }
    };

    fetchObjects();
  }, [instanceUrl, accessToken]);

  // Field Fetcher with global caching
  const fetchFields = useCallback(async (objectName: string) => {
    if (!objectName) return;
    
    // Return cached fields if available globally
    if (globalCache.fields[objectName]) {
      setFields(prev => ({
        ...prev,
        [objectName]: globalCache.fields[objectName]
      }));
      setReferenceFields(prev => ({
        ...prev,
        [objectName]: globalCache.referenceFields[objectName] || {}
      }));
      return;
    }

    try {
      setIsFieldLoading(true);

      // Fetch object fields
      const objectFields = await fetchObjectFields(instanceUrl, accessToken, objectName);
      
      // Update global cache and state
      globalCache.fields[objectName] = objectFields;
      setFields(prev => ({
        ...prev,
        [objectName]: objectFields,
      }));

      // Fetch and cache reference fields
      const referenceFieldsResult = await fetchReferenceFields(objectFields);
      globalCache.referenceFields[objectName] = referenceFieldsResult;
      setReferenceFields(prev => ({
        ...prev,
        [objectName]: referenceFieldsResult,
      }));

    } catch (error) {
      console.error(`Error fetching fields for ${objectName}:`, error);
    } finally {
      setIsFieldLoading(false);
    }
  }, [instanceUrl, accessToken]);

  // Reference Field Fetcher with global caching
  const fetchReferenceFields = async (fields: Field[]) => {
    const referenceFieldPromises = fields
      .filter(
        (field) =>
          field.type === "reference" &&
          field.referenceTo &&
          field.referenceTo.length > 0
      )
      .map(async (field) => {
        try {
          const refObjectName = field.referenceTo![0];
          
          // Check global cache for reference fields
          if (globalCache.referenceFields[refObjectName]?.[field.name]) {
            return { [field.name]: globalCache.referenceFields[refObjectName][field.name] };
          }

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

  return {
    sObjects,
    fields,
    referenceFields,
    fetchFields,
    isFieldLoading,
  };
};

export default useFieldFetcher;
