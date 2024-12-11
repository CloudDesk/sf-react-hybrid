import { useState } from 'react';
import { Field } from '../components/CKEditor/types';
import { useSalesforce } from '../contexts/SalesforceContext';

interface LookupPath {
  field: Field;
  fields: Field[];
}

interface UseFieldSelectionProps {
  initialFields: Field[];
  multiSelect?: boolean;
}

export const useFieldSelection = ({ initialFields, multiSelect = true }: UseFieldSelectionProps) => {
  const { loadFields } = useSalesforce();
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [lookupPath, setLookupPath] = useState<LookupPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFieldListVisible, setIsFieldListVisible] = useState(false);

  // Get filtered fields based on search
  const filteredFields = fields.filter(field => 
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Build the current path for field selection
  const getCurrentPath = (field: Field): string => {
    let path = field.value;
    for (let i = lookupPath.length - 1; i >= 0; i--) {
      path = `${lookupPath[i].field.value}.${path}`;
    }
    return path;
  };

  // Check if a field is selected
  const isFieldSelected = (field: Field): boolean => {
    const fullPath = getCurrentPath(field);
    return selectedFields.includes(fullPath);
  };

  // Handle field selection
  const handleFieldSelect = (field: Field) => {
    if (field.type?.toLowerCase() === 'reference' && field.referenceTo) {
      handleLookupSelect(field);
      return;
    }

    const fullPath = getCurrentPath(field);

    if (!multiSelect) {
      setSelectedFields([fullPath]);
      setIsFieldListVisible(false);
    } else {
      setSelectedFields(prev => 
        prev.includes(fullPath)
          ? prev.filter(f => f !== fullPath)
          : [...prev, fullPath]
      );
    }
  };

  // Handle lookup field selection
  const handleLookupSelect = async (field: Field) => {
    if (!field.referenceTo) return;

    setIsLoading(true);
    try {
      const lookupFields = await loadFields(
        localStorage.getItem('sf_instance_url') || '',
        localStorage.getItem('sf_access_token') || '',
        field.referenceTo
      );
      setLookupPath(prev => [...prev, { field, fields: lookupFields }]);
      setFields(lookupFields);
      setSearchTerm('');
    } catch (error) {
      console.error('Error loading lookup fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation in lookup path
  const handleBack = () => {
    if (lookupPath.length > 0) {
      const newPath = lookupPath.slice(0, -1);
      setLookupPath(newPath);
      setFields(newPath.length > 0 ? newPath[newPath.length - 1].fields : initialFields);
      setSearchTerm('');
    }
  };

  // Handle click outside
  const handleClickOutside = () => {
    setIsFieldListVisible(false);
    setLookupPath([]);
    setFields(initialFields);
    setSearchTerm('');
  };

  // Reset state
  const reset = () => {
    setSelectedFields([]);
    setLookupPath([]);
    setFields(initialFields);
    setSearchTerm('');
    setIsFieldListVisible(false);
    setIsLoading(false);
  };

  return {
    fields: filteredFields,
    selectedFields,
    lookupPath,
    isLoading,
    searchTerm,
    isFieldListVisible,
    setSelectedFields,
    setSearchTerm,
    setIsFieldListVisible,
    handleFieldSelect,
    handleLookupSelect,
    handleBack,
    handleClickOutside,
    isFieldSelected,
    getCurrentPath,
    reset,
  };
}; 