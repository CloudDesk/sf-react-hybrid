import { useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import {
  fetchObjectFields,
  fetchSalesforceObjects,
} from "../services/salesforceService";

import { Field } from "../components/SF/index"; // Import Field type

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
  const [sObjects, setSObjects] = useState<string[]>([]);
  const [fields, setFields] = useState<{ [key: string]: Field[] }>({});
  const [referenceFields, setReferenceFields] = useState<{
    [key: string]: { [key: string]: Field[] };
  }>({});
  const [isFieldLoading, setIsFieldLoading] = useState(false);

  // Fetch Salesforce Objects on Initial Load
  useState(() => {
    const fetchObjects = async () => {
      try {
        const response = await fetchSalesforceObjects(instanceUrl, accessToken);
        setSObjects(response.sobjects?.map((obj: any) => obj.name) || []);
      } catch (error) {
        console.error("Error fetching Salesforce objects:", error);
      }
    };
    fetchObjects();
  });

  // Debounced Field Fetcher
  const fetchFields = useCallback(
    debounce(async (objectName: string) => {
      if (!objectName) return;

      try {
        setIsFieldLoading(true);

        // Fetch object fields and reference fields concurrently
        const [objectFields, referenceFieldsResult] = await Promise.all([
          fetchObjectFields(instanceUrl, accessToken, objectName),
          fetchReferenceFields(
            await fetchObjectFields(instanceUrl, accessToken, objectName)
          ),
        ]);

        // Update state with functional updates
        setFields((prev) => ({
          ...prev,
          [objectName]: objectFields,
        }));

        setReferenceFields((prev) => ({
          ...prev,
          [objectName]: referenceFieldsResult,
        }));
      } catch (error) {
        console.error(`Error fetching fields for ${objectName}:`, error);
      } finally {
        setIsFieldLoading(false);
      }
    }, 500),
    [instanceUrl, accessToken]
  );

  // Reference Field Fetcher
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
