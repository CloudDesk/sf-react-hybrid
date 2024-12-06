import React, { useState, useEffect, useRef } from 'react';
import FieldSelector from '../Common/FieldSelector';

interface ContextMenuProps {
  position: { x: number; y: number };
  onSelect: (action: string, fieldPath?: string) => void;
  isOpen: boolean;
  instanceUrl: string;
  accessToken: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onSelect,
  isOpen,
  instanceUrl,
  accessToken
}) => {
  const [activeTab, setActiveTab] = useState('salesforce');
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState({
    left: '0px',
    top: '0px',
    transform: 'translate(-50%, 8px)',
    opacity: 0,
    maxHeight: '80vh'
  });

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const calculatePosition = () => {
        const menu = menuRef.current;
        if (!menu) return;

        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 16;

        // Initial position
        let x = position.x;
        let y = position.y;
        let transform = 'translate(-50%, 8px)';
        let maxHeight = '80vh';

        // Horizontal positioning
        if (x + (menuRect.width / 2) > viewportWidth - padding) {
          // Right edge case
          x = viewportWidth - padding - (menuRect.width / 2);
          transform = 'translate(-50%, 8px)';
        } else if (x - (menuRect.width / 2) < padding) {
          // Left edge case
          x = padding + (menuRect.width / 2);
          transform = 'translate(-50%, 8px)';
        }

        // Vertical positioning
        if (y + menuRect.height > viewportHeight - padding) {
          // Bottom edge case
          const spaceBelow = viewportHeight - y - padding;
          const spaceAbove = y - padding;

          if (spaceAbove > spaceBelow) {
            // Position above the cursor
            y = y - 8;
            transform = 'translate(-50%, -100%)';
            maxHeight = `${spaceAbove}px`;
          } else {
            // Position below but constrain height
            y = y + 8;
            maxHeight = `${spaceBelow}px`;
          }
        }

        // Mobile responsiveness
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          const mobileWidth = Math.min(320, window.innerWidth - 32);
          x = window.innerWidth / 2;
          maxHeight = '70vh';
          menu.style.width = `${mobileWidth}px`;
        }

        requestAnimationFrame(() => {
          setMenuStyle({
            left: `${x}px`,
            top: `${y}px`,
            transform,
            opacity: 1,
            maxHeight
          });
        });
      };

      // Calculate initial position
      calculatePosition();

      // Recalculate on resize
      const handleResize = () => {
        calculatePosition();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [position, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'salesforce', label: 'Salesforce Fields' },
    { id: 'condition', label: 'Conditions' },
    { id: 'loop', label: 'Loops' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] context-menu-container bg-white rounded-lg shadow-xl border border-gray-200 
                overflow-hidden backdrop-blur-sm bg-white/95"
      style={{
        ...menuStyle,
        minWidth: '300px',
        maxWidth: 'min(90vw, 400px)',
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50/80">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                transition-all duration-200`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: `calc(${menuStyle.maxHeight} - 45px)` }}>
        {activeTab === 'salesforce' && (
          <FieldSelector
            onFieldSelect={(fieldPath) => onSelect('salesforce', fieldPath)}
            instanceUrl={instanceUrl}
            accessToken={accessToken}
            className="p-3"
          />
        )}

        {activeTab === 'condition' && (
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-600">
              <h3 className="font-medium text-gray-900 mb-2">Conditional Block</h3>
              <p>Creates a section that only renders if condition is true.</p>
              <code className="block bg-gray-50 p-2 mt-2 rounded text-xs font-mono whitespace-pre-wrap">
                {`{#condition}
  Content to show if true
{/condition}`}
              </code>
            </div>
            <button
              className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 
                       bg-blue-50 rounded-lg hover:bg-blue-100 
                       transition-all duration-200"
              onClick={() => onSelect('condition')}
            >
              Add Condition Block
            </button>
          </div>
        )}

        {activeTab === 'loop' && (
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-600">
              <h3 className="font-medium text-gray-900 mb-2">Loop Block</h3>
              <p>Creates a section that repeats for each item in an array.</p>
              <code className="block bg-gray-50 p-2 mt-2 rounded text-xs font-mono whitespace-pre-wrap">
                {`{#items}
  {.} or {name}
{/items}`}
              </code>
            </div>
            <button
              className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 
                       bg-blue-50 rounded-lg hover:bg-blue-100 
                       transition-all duration-200"
              onClick={() => onSelect('loop')}
            >
              Add Loop Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextMenu; 