import React, { useEffect, useRef, useState } from "react";
import { Field } from "../../SF";
import Accordion from "../Accordion";

interface PopoverFieldSelectorProps {
  fields: Field[];
  referenceFields: { [key: string]: Field[] };
  position: { x: number; y: number };
  onFieldSelect: (field: Field, refField?: string) => void;
  onClose: () => void;
}

const PopoverFieldSelector = ({
  fields,
  referenceFields,
  position,
  onFieldSelect,
  onClose,
}: PopoverFieldSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredFields = fields.filter(
    (field) =>
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferenceFields = Object.entries(referenceFields).filter(
    ([fieldName, fields]) =>
      fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fields.some(
        (field) =>
          field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: position.y + window.scrollY,
        left: position.x,
        transform: "translate(-50%, 8px)",
        zIndex: 1000,
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 w-80"
    >
      <div className="p-2">
        <input
          type="text"
          placeholder="Search fields..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
        {/* Regular Fields */}
        <div className="p-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Standard Fields
          </h3>
          {filteredFields.map((field) => (
            <button
              key={field.name}
              onClick={() => onFieldSelect(field)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md focus:bg-gray-100 focus:outline-none transition-colors duration-150"
            >
              <div className="text-sm font-medium text-gray-900">
                {field.label}
              </div>
              <div className="text-xs text-gray-500">{field.name}</div>
            </button>
          ))}
        </div>

        {/* Reference Fields */}
        {filteredReferenceFields.length > 0 && (
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Reference Fields
            </h3>
            {filteredReferenceFields.map(([refFieldName, refFields]) => (
              <Accordion
                key={refFieldName}
                title={
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {fields.find((f) => f.name === refFieldName)?.label ||
                        refFieldName}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({refFieldName})
                    </span>
                  </div>
                }
              >
                <div className="pl-2 space-y-1">
                  {refFields.map((field) => (
                    <button
                      key={`${refFieldName}.${field.name}`}
                      onClick={() => onFieldSelect(field, refFieldName)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md focus:bg-gray-100 focus:outline-none transition-colors duration-150"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {field.label}
                      </div>
                      <div className="text-xs text-gray-500">{field.name}</div>
                    </button>
                  ))}
                </div>
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopoverFieldSelector;
