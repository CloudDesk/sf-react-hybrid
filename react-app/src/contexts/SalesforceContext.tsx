import React, { createContext, useContext, useState, useCallback } from 'react';
import { Field } from '../components/CKEditor/types';

interface SalesforceContextType {
  objects: Field[];
  fields: Field[];
  selectedObject: string | null;
  isLoadingFields: boolean;
  setObjects: (objects: Field[]) => void;
  setFields: (fields: Field[]) => void;
  fetchFields: (objectName: string, token: string) => Promise<void>;
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

interface SalesforceProviderProps {
  children: React.ReactNode;
}

export const SalesforceProvider: React.FC<SalesforceProviderProps> = ({ children }) => {
  const [objects, setObjects] = useState<Field[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  const fetchFields = useCallback(async (objectName: string, token: string) => {
    setIsLoadingFields(true);
    setSelectedObject(objectName);
    try {
      // Replace with your actual API call
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/salesforce/fields/${objectName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch fields');
      }

      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setFields([]);
    } finally {
      setIsLoadingFields(false);
    }
  }, []);

  const clearFields = useCallback(() => {
    setFields([]);
  }, []);

  const clearSelectedObject = useCallback(() => {
    setSelectedObject(null);
    clearFields();
  }, [clearFields]);

  const value = {
    objects,
    fields,
    selectedObject,
    isLoadingFields,
    setObjects,
    setFields,
    fetchFields,
    clearFields,
    clearSelectedObject,
  };

  return (
    <SalesforceContext.Provider value={value}>
      {children}
    </SalesforceContext.Provider>
  );
}; 