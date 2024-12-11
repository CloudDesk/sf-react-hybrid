import React, { useState, useEffect } from 'react';
import { useSalesforce } from '../../../../contexts/SalesforceContext';
import { DataUnit } from './types';
import { DataUnitManagementModal } from './DataUnitManagementModal';

interface DataUnitsTabProps {
  onDataUnitsChange: (dataUnits: Array<{
    name: string;
    developerName: string;
    fields: string[];
  }>) => void;
}

export const DataUnitsTab: React.FC<DataUnitsTabProps> = ({ onDataUnitsChange }) => {
  const [dataUnits, setDataUnits] = useState<Array<{
    name: string;
    developerName: string;
    fields: string[];
  }>>([]);
  const [editingDataUnit, setEditingDataUnit] = useState<{
    name: string;
    developerName: string;
    fields: string[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateDataUnit = (dataUnit: {
    name: string;
    developerName: string;
    fields: string[];
  }) => {
    if (editingDataUnit) {
      setDataUnits(prev => prev.map(du => {
        if (du.developerName === editingDataUnit.developerName) {
          return dataUnit;
        }
        return du;
      }));
    } else {
      setDataUnits(prev => [...prev, dataUnit]);
    }
    setIsModalOpen(false);
    setEditingDataUnit(null);
  };

  useEffect(() => {
    onDataUnitsChange(dataUnits);
  }, [dataUnits, onDataUnitsChange]);

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

      <div className="space-y-2">
        {dataUnits.map((dataUnit) => (
          <div
            key={dataUnit.developerName}
            className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{dataUnit.name}</h4>
                </div>
                <p className="text-sm text-gray-500">{dataUnit.developerName}</p>
              </div>
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
        ))}
      </div>

      <DataUnitManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDataUnit(null);
        }}
        onCreate={handleCreateDataUnit}
        editingDataUnit={editingDataUnit}
      />
    </div>
  );
};

export default DataUnitsTab; 