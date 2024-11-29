import React, { createContext, useContext, useState, useCallback } from 'react';
import { Field } from '../components/CKEditor/types';
import { fetchObjects, fetchFields } from '../services/salesforceService';

interface SalesforceContextType {
  objects: Field[];
  fields: Record<string, Field[]>;
  selectedObject: string | null;
  isLoadingFields: boolean;
  loadObjects: (instanceUrl: string, accessToken: string) => Promise<void>;
  loadFields: (instanceUrl: string, accessToken: string, objectName: string) => Promise<Field[]>;
  clearFields: () => void;
  clearSelectedObject: () => void;
}

const SalesforceContext = createContext<SalesforceContextType | undefined>(undefined);

export const useSalesforce = () => {
  const context = useContext(SalesforceContext);
  if (!context) {
    throw new Error('useSalesforce must be used within a SalesforceProvider');
  }
  return context;
};

export const SalesforceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [objects, setObjects] = useState<Field[]>([]);
  const [fields, setFields] = useState<Record<string, Field[]>>({});
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  const loadObjects = useCallback(async (instanceUrl: string, accessToken: string) => {
    try {
      const objectsData = await fetchObjects(instanceUrl, accessToken);
      setObjects(objectsData);
    } catch (error) {
      console.error('Error loading objects:', error);
      setObjects([]);
    }
  }, []);

  const loadFields = useCallback(async (instanceUrl: string, accessToken: string, objectName: string) => {
    setIsLoadingFields(true);
    try {
      if (fields[objectName]) {
        console.log('Using cached fields for', objectName, fields[objectName]);
        setIsLoadingFields(false);
        return fields[objectName];
      }

      const fieldsData = await fetchFields(instanceUrl, accessToken, objectName);
      console.log('Fetched fields for', objectName, fieldsData);
      
      const transformedFields = fieldsData.map(field => ({
        ...field,
        type: field.type || 'string'
      }));

      setFields(prev => ({
        ...prev,
        [objectName]: transformedFields
      }));

      setIsLoadingFields(false);
      return transformedFields;
    } catch (error) {
      console.error('Error loading fields:', error);
      setIsLoadingFields(false);
      return [];
    }
  }, [fields]);

  const clearFields = useCallback(() => {
    setFields({});
  }, []);

  const clearSelectedObject = useCallback(() => {
    setSelectedObject(null);
  }, []);

  const value = {
    objects,
    fields,
    selectedObject,
    isLoadingFields,
    loadObjects,
    loadFields,
    clearFields,
    clearSelectedObject,
  };

  return (
    <SalesforceContext.Provider value={value}>
      {children}
    </SalesforceContext.Provider>
  );
}; 