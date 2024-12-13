import React, { useState, useEffect } from 'react';
import { useSalesforce } from '../../../../contexts/SalesforceContext';
import { DataUnit, FilterCondition } from './types';
import { DataUnitManagementModal } from './DataUnitManagementModal';
import { getExecutionOrder, validateDataUnitReferences } from './utils';

interface DataUnitsTabProps {
  onDataUnitsChange: (dataUnits: DataUnit[]) => void;
}

export const DataUnitsTab: React.FC<DataUnitsTabProps> = ({ onDataUnitsChange }) => {
  const [dataUnits, setDataUnits] = useState<DataUnit[]>([]);
  const [editingDataUnit, setEditingDataUnit] = useState<DataUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [executionOrder, setExecutionOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (dataUnits.length > 0) {
        validateDataUnitReferences(dataUnits);
        const order = getExecutionOrder(dataUnits);
        setExecutionOrder(order);
        setError(null);
      } else {
        setExecutionOrder([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [dataUnits]);

  const handleCreateDataUnit = (dataUnit: DataUnit) => {
    try {
      const newDataUnits = editingDataUnit
        ? dataUnits.map(du => du.developerName === editingDataUnit.developerName ? dataUnit : du)
        : [...dataUnits, dataUnit];

      validateDataUnitReferences(newDataUnits);
      setDataUnits(newDataUnits);
      setIsModalOpen(false);
      setEditingDataUnit(null);
      onDataUnitsChange(newDataUnits);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  const getDataUnitDependencies = (unit: DataUnit): string[] => {
    // Get unique dependencies from both main filters and child unit filters
    const dependencies = new Set<string>();
    
    // Add dependencies from main filters
    unit.filters
      .filter((filter): filter is FilterCondition & { reference: NonNullable<FilterCondition['reference']> } =>
        filter.valueType === 'reference' && filter.reference !== undefined
      )
      .forEach(filter => dependencies.add(filter.reference.dataUnit));

    // Add dependencies from child unit filters
    unit.childUnits.forEach(child => {
      child.filters
        .filter((filter): filter is FilterCondition & { reference: NonNullable<FilterCondition['reference']> } =>
          filter.valueType === 'reference' && filter.reference !== undefined
        )
        .forEach(filter => dependencies.add(filter.reference.dataUnit));
    });

    return Array.from(dependencies);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Data Units</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Data Unit
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {executionOrder.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Execution Order</h4>
          <div className="flex flex-wrap gap-2">
            {executionOrder.map((developerName, index) => (
              <div key={developerName} className="flex items-center">
                <span className="text-gray-500">{index + 1}.</span>
                <span className="ml-1 text-gray-900">{developerName}</span>
                {index < executionOrder.length - 1 && (
                  <svg className="w-4 h-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {dataUnits.map((dataUnit) => {
          const dependencies = getDataUnitDependencies(dataUnit);
          return (
            <div
              key={dataUnit.developerName}
              className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{dataUnit.name}</h4>
                </div>
                <p className="text-sm text-gray-500">{dataUnit.developerName}</p>
                {dependencies.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-500">
                      Referenced in filters: {dependencies.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingDataUnit(dataUnit);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DataUnitManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDataUnit(null);
        }}
        onCreate={handleCreateDataUnit}
        editingDataUnit={editingDataUnit}
        existingDataUnits={dataUnits}
      />
    </div>
  );
};

export default DataUnitsTab; 