import React, { useState, useEffect, useCallback } from 'react';
import { useSalesforce } from '../../../../contexts/SalesforceContext';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { DataUnit, FilterCondition, ChildUnit, DataUnitReference } from './types';
import FilterBuilder from './FilterBuilder';
import { AdvancedFieldSelection } from './AdvancedFieldSelection';
import { validateDataUnitReferences } from './utils';

interface LookupPath {
  field: Field;
  fields: Field[];
}

interface DataUnitManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dataUnit: DataUnit) => void;
  editingDataUnit: DataUnit | null;
  existingDataUnits: DataUnit[];
}

type TabType = 'info' | 'fields' | 'filters' | 'children';
type ChildUnitTabType = 'fields' | 'filters';

export const DataUnitManagementModal: React.FC<DataUnitManagementModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editingDataUnit,
  existingDataUnits,
}) => {
  const { objects, loadFields } = useSalesforce();
  const [name, setName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['Id']);
  const [objectFields, setObjectFields] = useState<Field[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterLogic, setFilterLogic] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isSqlPreviewOpen, setIsSqlPreviewOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lookupPath, setLookupPath] = useState<LookupPath[]>([]);
  const [currentFields, setCurrentFields] = useState<Field[]>([]);
  const [childUnits, setChildUnits] = useState<ChildUnit[]>([]);
  const [editingChildUnit, setEditingChildUnit] = useState<ChildUnit | null>(null);
  const [isAddingChildUnit, setIsAddingChildUnit] = useState(false);
  const [selectedChildRelation, setSelectedChildRelation] = useState('');
  const [childFields, setChildFields] = useState<Field[]>([]);
  const [selectedChildFields, setSelectedChildFields] = useState<string[]>(['Id']);
  const [childFilterConditions, setChildFilterConditions] = useState<FilterCondition[]>([]);
  const [childFilterLogic, setChildFilterLogic] = useState('');
  const [isLoadingChildFields, setIsLoadingChildFields] = useState(false);
  const [childLookupPath, setChildLookupPath] = useState<{ field: Field; fields: Field[]; }[]>([]);
  const [activeChildTab, setActiveChildTab] = useState<'fields' | 'filters'>('fields');
  const [childSearchTerm, setChildSearchTerm] = useState('');
  const [availableChildRelations, setAvailableChildRelations] = useState<Field[]>([]);

  useEffect(() => {
    if (editingDataUnit) {
      setName(editingDataUnit.name);
      setDeveloperName(editingDataUnit.developerName);
      setDescription(editingDataUnit.description);
      setSelectedObject(editingDataUnit.object);
      setSelectedFields(editingDataUnit.fields);
      setFilterConditions(editingDataUnit.filters);
      setFilterLogic(editingDataUnit.filterLogic);
      setChildUnits(editingDataUnit.childUnits || []);
    } else {
      resetForm();
    }
  }, [editingDataUnit]);

  useEffect(() => {
    if (selectedObject) {
      setIsLoadingFields(true);
      loadFields(
        localStorage.getItem('sf_instance_url') || '',
        localStorage.getItem('sf_access_token') || '',
        selectedObject
      ).then((fields) => {
        setObjectFields(fields);
        setCurrentFields(fields);
        const childFields = fields.filter(field => field.type === 'childRelationship');
        setAvailableChildRelations(childFields);
        setIsLoadingFields(false);
      }).catch(() => {
        setObjectFields([]);
        setCurrentFields([]);
        setAvailableChildRelations([]);
        setIsLoadingFields(false);
      });
    }
  }, [selectedObject, loadFields]);

  const resetForm = () => {
    setName('');
    setDeveloperName('');
    setDescription('');
    setSelectedObject('');
    setSelectedFields(['Id']);
    setFilterConditions([]);
    setFilterLogic('');
    setSearchTerm('');
    setLookupPath([]);
    setCurrentFields([]);
    setChildUnits([]);
    setEditingChildUnit(null);
    setIsAddingChildUnit(false);
    setSelectedChildRelation('');
    setChildFields([]);
    setSelectedChildFields(['Id']);
    setChildFilterConditions([]);
    setChildFilterLogic('');
    setChildLookupPath([]);
  };

  const handleSubmit = () => {
    try {
      const newDataUnit: DataUnit = {
        name,
        developerName,
        description,
        object: selectedObject,
        fields: selectedFields,
        filters: filterConditions,
        filterLogic,
        childUnits,
      };

      validateDataUnitReferences([...existingDataUnits, newDataUnit]);
      
      onCreate(newDataUnit);
      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const generateSoqlPreview = () => {
    if (!selectedObject || selectedFields.length === 0) return '';

    let soql = `SELECT ${selectedFields.join(',\n       ')}`;

    // Add child units
    if (childUnits.length > 0) {
      soql += ',\n       ' + childUnits.map(child => {
        let childSoql = `(SELECT ${child.fields.join(', ')}\n        FROM ${child.relationshipName}`;
        
        if (child.filters.length > 0) {
          if (child.filterLogic) {
            let whereClause = child.filterLogic;
            child.filters.forEach((condition: FilterCondition, index: number) => {
              const value = condition.valueType === 'reference'
                ? condition.value  // Already formatted as {!DataUnit.Field}
                : condition.operator === 'LIKE'
                  ? `'%${condition.value}%'`
                  : condition.operator === 'IN' || condition.operator === 'NOT IN'
                    ? `(${condition.value})`
                    : `'${condition.value}'`;

              const conditionStr = `${condition.field} ${condition.operator} ${value}`;
              whereClause = whereClause.replace(
                new RegExp(`\\b${index + 1}\\b`), 
                `(${conditionStr})`
              );
            });
            childSoql += `\n        WHERE ${whereClause}`;
          } else {
            const whereClause = child.filters
              .map((c: FilterCondition) => {
                const value = c.valueType === 'reference'
                  ? c.value  // Already formatted as {!DataUnit.Field}
                  : c.operator === 'LIKE'
                    ? `'%${c.value}%'`
                    : c.operator === 'IN' || c.operator === 'NOT IN'
                      ? `(${c.value})`
                      : `'${c.value}'`;
                return `${c.field} ${c.operator} ${value}`;
              })
              .join(' AND ');
            childSoql += `\n        WHERE ${whereClause}`;
          }
        }
        
        childSoql += ')';
        return childSoql;
      }).join(',\n       ');
    }

    soql += `\nFROM ${selectedObject}`;
    
    // Add main query filters
    if (filterConditions.length > 0) {
      if (filterLogic) {
        let whereClause = filterLogic;
        filterConditions.forEach((condition, index) => {
          const value = condition.valueType === 'reference'
            ? condition.value  // Already formatted as {!DataUnit.Field}
            : condition.operator === 'LIKE'
              ? `'%${condition.value}%'`
              : condition.operator === 'IN' || condition.operator === 'NOT IN'
                ? `(${condition.value})`
                : `'${condition.value}'`;

          const conditionStr = `${condition.field} ${condition.operator} ${value}`;
          whereClause = whereClause.replace(
            new RegExp(`\\b${index + 1}\\b`), 
            `(${conditionStr})`
          );
        });
        soql += `\nWHERE ${whereClause}`;
      } else {
        const whereClause = filterConditions
          .map(c => {
            const value = c.valueType === 'reference'
              ? c.value  // Already formatted as {!DataUnit.Field}
              : c.operator === 'LIKE'
                ? `'%${c.value}%'`
                : c.operator === 'IN' || c.operator === 'NOT IN'
                  ? `(${c.value})`
                  : `'${c.value}'`;
            return `${c.field} ${c.operator} ${value}`;
          })
          .join(' AND ');
        soql += `\nWHERE ${whereClause}`;
      }
    }

    return soql;
  };

  const handleFieldSelect = (field: Field) => {
    const getCurrentPath = (field: Field): string => {
      let path = field.value;
      for (let i = lookupPath.length - 1; i >= 0; i--) {
        path = `${lookupPath[i].field.value}.${path}`;
      }
      return path;
    };

    const fullPath = getCurrentPath(field);
    setSelectedFields(prev => 
      prev.includes(fullPath)
        ? prev.filter(f => f !== fullPath)
        : [...prev, fullPath]
    );
  };

  const handleLookupSelect = async (field: Field) => {
    if (!field.referenceTo) return;

    setIsLoadingFields(true);
    try {
      const lookupFields = await loadFields(
        localStorage.getItem('sf_instance_url') || '',
        localStorage.getItem('sf_access_token') || '',
        field.referenceTo
      );
      setLookupPath(prev => [...prev, { field, fields: lookupFields }]);
      setCurrentFields(lookupFields);
      setSearchTerm('');
    } catch (error) {
      console.error('Error loading lookup fields:', error);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleBack = () => {
    if (lookupPath.length > 0) {
      const newPath = lookupPath.slice(0, -1);
      setLookupPath(newPath);
      setCurrentFields(newPath.length > 0 ? newPath[newPath.length - 1].fields : objectFields);
      setSearchTerm('');
    }
  };

  const handleChildRelationSelect = async (relationshipName: string) => {
    setIsLoadingChildFields(true);
    setSelectedChildRelation(relationshipName);
    setChildLookupPath([]);
    
    try {
      const childField = availableChildRelations.find(
        f => f.childRelationship?.relationshipName === relationshipName
      );
      if (childField?.childRelationship?.childSObject) {
        const fields = await loadFields(
          localStorage.getItem('sf_instance_url') || '',
          localStorage.getItem('sf_access_token') || '',
          childField.childRelationship.childSObject
        );
        setChildFields(fields);
      }
    } catch (error) {
      console.error('Error loading child fields:', error);
      setChildFields([]);
    } finally {
      setIsLoadingChildFields(false);
    }
  };

  const handleChildLookupSelect = async (field: Field) => {
    if (!field.referenceTo) return;

    setIsLoadingChildFields(true);
    try {
      const lookupFields = await loadFields(
        localStorage.getItem('sf_instance_url') || '',
        localStorage.getItem('sf_access_token') || '',
        field.referenceTo
      );
      setChildLookupPath(prev => [...prev, { field, fields: lookupFields }]);
      setChildFields(lookupFields);
    } catch (error) {
      console.error('Error loading lookup fields:', error);
    } finally {
      setIsLoadingChildFields(false);
    }
  };

  const handleChildBack = () => {
    if (childLookupPath.length > 0) {
      const newPath = childLookupPath.slice(0, -1);
      setChildLookupPath(newPath);
      if (newPath.length > 0) {
        setChildFields(newPath[newPath.length - 1].fields);
      } else {
        handleChildRelationSelect(selectedChildRelation);
      }
    }
  };

  const handleAddChildUnit = () => {
    if (!selectedChildRelation) return;

    const newChildUnit: ChildUnit = {
      relationshipName: selectedChildRelation,
      fields: selectedChildFields,
      filters: childFilterConditions,
      filterLogic: childFilterLogic,
    };

    if (editingChildUnit) {
      setChildUnits(prev => prev.map(unit => 
        unit.relationshipName === editingChildUnit.relationshipName ? newChildUnit : unit
      ));
      setEditingChildUnit(null);
    } else {
      setChildUnits(prev => [...prev, newChildUnit]);
    }
    
    // Reset child unit form
    setSelectedChildRelation('');
    setSelectedChildFields(['Id']);
    setChildFilterConditions([]);
    setChildFilterLogic('');
    setChildLookupPath([]);
    setIsAddingChildUnit(false);
  };

  const handleEditChildUnit = (unit: ChildUnit) => {
    setEditingChildUnit(unit);
    setSelectedChildRelation(unit.relationshipName);
    setSelectedChildFields(unit.fields);
    setChildFilterConditions(unit.filters);
    setChildFilterLogic(unit.filterLogic);
    setIsAddingChildUnit(true);
    handleChildRelationSelect(unit.relationshipName);
  };

  const handleRemoveChildUnit = (relationshipName: string) => {
    setChildUnits(prev => prev.filter(u => u.relationshipName !== relationshipName));
  };

  const handleCancelChildUnit = () => {
    setSelectedChildRelation('');
    setSelectedChildFields(['Id']);
    setChildFilterConditions([]);
    setChildFilterLogic('');
    setChildLookupPath([]);
    setIsAddingChildUnit(false);
    setEditingChildUnit(null);
  };

  const getFullFieldPath = (field: Field) => {
    return childLookupPath.reduce((path, lookup) => {
      return `${lookup.field.relationshipName}.${path}`;
    }, field.value);
  };

  const isFieldSelected = (field: Field) => {
    const fullPath = getFullFieldPath(field);
    return selectedChildFields.includes(fullPath);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-[1000px] h-[800px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0 bg-docblitz-50">
          <h2 className="text-lg font-medium text-docblitz-900">
            {editingDataUnit ? 'Edit Data Unit' : 'Create New Data Unit'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="border-b flex-shrink-0">
          <nav className="flex">
            {(['info', 'fields', 'filters', 'children'] as const).map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-docblitz-500 text-docblitz-600 bg-docblitz-50'
                    : 'border-transparent text-gray-500 hover:text-docblitz-600 hover:border-docblitz-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6" style={{ height: '400px' }}>
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Developer Name</label>
                  <input
                    type="text"
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Object</label>
                  <select
                    value={selectedObject}
                    onChange={(e) => setSelectedObject(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select an object</option>
                    {objects.map((obj) => (
                      <option key={obj.value} value={obj.value}>
                        {obj.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'fields' && selectedObject && (
              <div className="flex h-full gap-4">
                {/* Left Pane - Field Search and Selection */}
                <div className="w-2/3 flex flex-col">
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg 
                        className="w-4 h-4 text-gray-400"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search fields..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg flex-1 overflow-hidden">
                    <AdvancedFieldSelection
                      fields={currentFields}
                      selectedFields={selectedFields}
                      onFieldSelect={handleFieldSelect}
                      onLookupSelect={handleLookupSelect}
                      onBack={handleBack}
                      lookupPath={lookupPath}
                      isLoading={isLoadingFields}
                      onClickAway={() => {
                        setLookupPath([]);
                        setCurrentFields(objectFields);
                        setSearchTerm('');
                      }}
                    />
                  </div>
                </div>

                {/* Right Pane - Selected Fields */}
                <div className="w-1/3 flex flex-col h-full">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">
                        Selected Fields ({selectedFields.length})
                      </div>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                      <div className="flex flex-wrap gap-2">
                        {selectedFields.map((field) => (
                          <div
                            key={field}
                            className="flex items-center bg-white border border-gray-200 text-gray-700 text-sm rounded-md px-2 py-1"
                          >
                            <span>{field}</span>
                            <button
                              onClick={() => setSelectedFields(prev => prev.filter(f => f !== field))}
                              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'filters' && selectedObject && (
              <div className="space-y-4">
                <FilterBuilder
                  conditions={filterConditions}
                  fields={objectFields}
                  onConditionChange={setFilterConditions}
                  filterLogic={filterLogic}
                  onFilterLogicChange={setFilterLogic}
                  existingDataUnits={existingDataUnits}
                  currentDataUnit={developerName}
                />
              </div>
            )}

            {activeTab === 'children' && selectedObject && (
              <div className="space-y-6">
                {/* List Header with New Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">Child Units</h3>
                  {!isAddingChildUnit && (
                    <button
                      onClick={() => setIsAddingChildUnit(true)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      New Child Unit
                    </button>
                  )}
                </div>

                {/* Child Units List */}
                <div className="space-y-3">
                  {childUnits.map((unit) => (
                    <div 
                      key={unit.relationshipName}
                      className="bg-white border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{unit.relationshipName}</h4>
                          <div className="mt-1 text-sm text-gray-500">
                            Fields: {unit.fields.join(', ')}
                          </div>
                          {unit.filters.length > 0 && (
                            <div className="mt-1 text-sm text-gray-500">
                              Filters: {unit.filters.length} condition(s)
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditChildUnit(unit)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveChildUnit(unit.relationshipName)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Inline Add/Edit Child Unit Form */}
                  {isAddingChildUnit && (
                    <div className="bg-white border rounded-lg divide-y">
                      {/* Header */}
                      <div className="p-4 flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">
                          {editingChildUnit ? 'Edit Child Unit' : 'Add Child Unit'}
                        </h4>
                        <button
                          onClick={handleCancelChildUnit}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Form Content */}
                      <div className="p-4 space-y-4">
                        {/* Child Unit Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Child Unit Type</label>
                          <select
                            value={selectedChildRelation}
                            onChange={(e) => handleChildRelationSelect(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            disabled={!!editingChildUnit}
                          >
                            <option value="">Select a child relationship</option>
                            {availableChildRelations
                              .filter(relation => relation.childRelationship?.relationshipName)
                              .map((relation) => (
                                <option 
                                  key={relation.childRelationship?.relationshipName} 
                                  value={relation.childRelationship?.relationshipName}
                                >
                                  {relation.label}
                                </option>
                              ))}
                          </select>
                        </div>

                        {selectedChildRelation && (
                          <>
                            {/* Tabs */}
                            <div className="border-t pt-4">
                              <nav className="flex">
                                {(['fields', 'filters'] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                      activeChildTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                    onClick={() => setActiveChildTab(tab)}
                                  >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                  </button>
                                ))}
                              </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="pt-4">
                              {activeChildTab === 'fields' && (
                                <div className="space-y-4">
                                  {/* Field Selection */}
                                  <div className="border rounded-lg overflow-hidden">
                                    <AdvancedFieldSelection
                                      fields={childFields}
                                      selectedFields={selectedChildFields}
                                      onFieldSelect={(field) => {
                                        if (field.type === 'reference' && field.referenceTo) {
                                          handleChildLookupSelect(field);
                                          return;
                                        }
                                        const fieldPath = childLookupPath.reduce((path, lookup) => {
                                          return `${lookup.field.relationshipName}.${path}`;
                                        }, field.value);
                                        setSelectedChildFields(prev => 
                                          prev.includes(fieldPath)
                                            ? prev.filter(f => f !== fieldPath)
                                            : [...prev, fieldPath]
                                        );
                                      }}
                                      isLoading={isLoadingChildFields}
                                      onLookupSelect={handleChildLookupSelect}
                                      onBack={handleChildBack}
                                      lookupPath={childLookupPath}
                                    />
                                  </div>

                                  {/* Selected Fields */}
                                  <div className="mt-4">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Fields</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedChildFields.map((field) => (
                                        <div
                                          key={field}
                                          className="flex items-center bg-gray-100 text-gray-700 text-sm rounded-md px-2 py-1"
                                        >
                                          <span>{field}</span>
                                          <button
                                            onClick={() => setSelectedChildFields(prev => prev.filter(f => f !== field))}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeChildTab === 'filters' && (
                                <div className="space-y-4">
                                  <FilterBuilder
                                    conditions={childFilterConditions}
                                    fields={childFields}
                                    onConditionChange={setChildFilterConditions}
                                    filterLogic={childFilterLogic}
                                    onFilterLogicChange={setChildFilterLogic}
                                    existingDataUnits={existingDataUnits}
                                    currentDataUnit={developerName}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="border-t pt-4 flex justify-end space-x-3">
                              <button
                                onClick={handleCancelChildUnit}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddChildUnit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                              >
                                {editingChildUnit ? 'Save Changes' : 'Add Child Unit'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SOQL Preview Panel */}
          <div className="border-t">
            <div className="p-4">
              <div
                className="flex items-center justify-between cursor-pointer text-sm text-gray-500 hover:text-docblitz-600"
                onClick={() => setIsSqlPreviewOpen(!isSqlPreviewOpen)}
              >
                <span className="font-medium">SOQL Preview</span>
                {isSqlPreviewOpen ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </div>
              {isSqlPreviewOpen && (
                <pre className="mt-2 p-4 bg-docblitz-50 rounded-md overflow-x-auto text-sm max-h-[200px] overflow-y-auto">
                  {generateSoqlPreview()}
                </pre>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end space-x-3 bg-docblitz-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-docblitz-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-docblitz-900 bg-docblitz-500 rounded-md hover:bg-docblitz-400 focus:outline-none focus:ring-2 focus:ring-docblitz focus:ring-offset-2"
            >
              {editingDataUnit ? 'Save Changes' : 'Create Data Unit'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}; 