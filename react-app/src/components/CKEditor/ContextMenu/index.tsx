import React, { useEffect, useState, useCallback } from 'react';
import { Tabs } from './Tabs';
import { FieldSelectionComponent } from './FieldSelectionComponent';
import { ContextMenuProps, Position } from '../types';
import ConditionBuilder from './ConditionBuilder';
import ConditionsList from './ConditionsList';

interface ContextMenuProps {
  contextMenu: any;
  activeTab: number;
  selectedObject: any;
  objects: any[];
  objectFields: any[];
  filteredFields: any[];
  searchQuery: string;
  isLoadingFields: boolean;
  onTabChange: (tab: number) => void;
  onObjectSelect: (object: any) => void;
  onFieldSelect: (field: any) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onConditionClick: (condition: any) => void;
  onLoopClick: () => void;
  onClickAway: () => void;
  onFieldPreview: (field: any) => void;
  onPreviewChange: (value: string) => void;
  handleContextMenuSelect: (action: string, append?: boolean, fieldPath?: string) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  isAdvancedMode?: boolean;
  dataUnits?: Array<{
    name: string;
    developerName: string;
    fields: string[];
  }>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  contextMenu, 
  activeTab, 
  selectedObject, 
  objects, 
  objectFields, 
  filteredFields, 
  searchQuery, 
  isLoadingFields, 
  onTabChange, 
  onObjectSelect, 
  onFieldSelect, 
  onSearchChange, 
  onReset, 
  onConditionClick, 
  onLoopClick, 
  onClickAway, 
  onFieldPreview, 
  onPreviewChange, 
  handleContextMenuSelect, 
  menuRef, 
  isAdvancedMode = false, 
  dataUnits = [],
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState<Position>(contextMenu.position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('context-menu-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - adjustedPosition.x,
        y: e.clientY - adjustedPosition.y
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Optional: Add boundary checks
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = menuRef.current?.offsetWidth || 0;
      const menuHeight = menuRef.current?.offsetHeight || 0;

      // Ensure the menu stays within viewport bounds
      const boundedX = Math.min(Math.max(menuWidth / 2, newX), viewportWidth - menuWidth / 2);
      const boundedY = Math.min(Math.max(menuHeight / 2, newY), viewportHeight - menuHeight / 2);

      setAdjustedPosition({ x: boundedX, y: boundedY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (contextMenu.isOpen && menuRef.current) {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      overlay.style.zIndex = '40';
      
      // Add click handler to overlay for closing
      overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) {
          onClickAway();
        }
      });

      document.body.appendChild(overlay);

      // Position menu
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Ensure menu stays within viewport bounds
      let x = contextMenu.position.x;
      let y = contextMenu.position.y;

      // Add smooth transitions for position adjustments
      menu.style.transition = 'transform 0.2s ease-out';

      // Check if menu is too close to viewport edges and adjust if necessary
      if (x - menuRect.width/2 < 20) {
        x = menuRect.width/2 + 20;
      } else if (x + menuRect.width/2 > viewportWidth - 20) {
        x = viewportWidth - menuRect.width/2 - 20;
      }

      if (y - menuRect.height/2 < 20) {
        y = menuRect.height/2 + 20;
      } else if (y + menuRect.height/2 > viewportHeight - 20) {
        y = viewportHeight - menuRect.height/2 - 20;
      }

      setAdjustedPosition({ x, y });

      return () => {
        if (document.body.contains(overlay)) {
          overlay.removeEventListener('mousedown', onClickAway);
          document.body.removeChild(overlay);
        }
      };
    }
  }, [contextMenu.isOpen, contextMenu.position, onClickAway]);

  if (!contextMenu.isOpen) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white border rounded-lg shadow-lg z-50"
        style={{
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          width: '500px',
          minHeight: '500px',
          maxHeight: '70vh',
          transform: 'translate(-50%, -50%)',
          boxShadow: isDragging 
            ? '0 8px 30px rgba(0, 0, 0, 0.25)' 
            : '0 4px 20px rgba(0, 0, 0, 0.15)',
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`context-menu-header bg-gray-50 px-6 py-3 rounded-t-lg cursor-move border-b flex items-center justify-between ${
            isDragging ? 'bg-gray-100' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <span className="font-medium text-gray-700 text-lg">Insert Field</span>
          <button 
            onClick={onClickAway}
            className="text-gray-400 hover:text-gray-600 text-xl px-2"
          >
            ×
          </button>
        </div>

        <div className="flex-grow flex flex-col">
          <Tabs activeTab={activeTab} onTabChange={onTabChange} />

          <div className="p-6 flex-grow overflow-y-auto" style={{ maxHeight: 'calc(70vh - 120px)' }}>
            {activeTab === 0 && (
              <div className="dropdown-content h-full">
                <FieldSelectionComponent 
                  selectedObject={selectedObject}
                  objectFields={objectFields}
                  filteredFields={filteredFields}
                  searchQuery={searchQuery}
                  isLoadingFields={isLoadingFields}
                  onObjectSelect={onObjectSelect}
                  onFieldSelect={onFieldSelect}
                  onSearchChange={onSearchChange}
                  onReset={onReset}
                  onFieldPreview={onFieldPreview}
                  onPreviewChange={onPreviewChange}
                  isAdvancedMode={isAdvancedMode}
                  dataUnits={dataUnits}
                />
              </div>
            )}
            
            {activeTab === 1 && (
              <div className="p-4">
                <ConditionsList
                  onSelect={(reference) => {
                    handleContextMenuSelect('condition', false, reference);
                    onClickAway();
                  }}
                />
              </div>
            )}
            
            {activeTab === 2 && (
              <button
                className="w-full text-left p-3 hover:bg-gray-100 rounded"
                onClick={onLoopClick}
              >
                Add FOR Loop
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContextMenu; 