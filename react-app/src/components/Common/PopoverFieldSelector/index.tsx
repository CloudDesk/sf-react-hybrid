import React from 'react';
import FieldSelector from '../FieldSelector';

interface PopoverFieldSelectorProps {
  position: { x: number; y: number };
  onFieldSelect: (field: string, append: boolean) => void;
  onClose: () => void;
  onAddCondition: () => void;
  objects: Array<{ value: string; label: string }>;
  getFields: (objectName: string) => Promise<any[]>;
}

const PopoverFieldSelector: React.FC<PopoverFieldSelectorProps> = ({
  position,
  onFieldSelect,
  onClose,
  onAddCondition,
  objects,
  getFields
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 8px)',
        minWidth: '300px',
      }}
      onClick={handleClick}
    >
      <FieldSelector
        onFieldSelect={onFieldSelect}
        objects={objects}
        getFields={getFields}
        className="p-4"
        onAddCondition={onAddCondition}
      />
    </div>
  );
};

export default PopoverFieldSelector;
