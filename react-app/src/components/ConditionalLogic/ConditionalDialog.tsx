import React, { useState, useEffect } from "react";
import { Field } from "../SF";

interface ConditionalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fields: Field[];
  onApply: (condition: string) => void;
}

const OPERATORS = [
  { label: "Equals", value: "==" },
  { label: "Not Equals", value: "!=" },
  { label: "Greater Than", value: ">" },
  { label: "Less Than", value: "<" },
  { label: "Greater Than or Equal", value: ">=" },
  { label: "Less Than or Equal", value: "<=" },
  { label: "Contains", value: "includes" },
];

const ConditionalDialog: React.FC<ConditionalDialogProps> = ({
  isOpen,
  onClose,
  fields,
  onApply,
}) => {
  const [selectedField, setSelectedField] = useState("");
  const [operator, setOperator] = useState("==");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleApply = () => {
    if (!selectedField || !operator || !value) return;
    const condition = `#if ${selectedField} ${operator} "${value}"`;
    onApply(condition);
    handleClose();
  };

  const handleClose = () => {
    setSelectedField("");
    setOperator("==");
    setValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add Conditional Logic
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Field
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
              >
                <option value="">Select a field</option>
                {fields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Operator
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter comparison value"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApply}
              disabled={!selectedField || !operator || !value}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionalDialog;
