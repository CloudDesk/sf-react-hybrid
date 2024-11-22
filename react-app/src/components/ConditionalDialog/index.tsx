import React, { useState } from "react";
import { Field } from "../SF";

interface ConditionalDialogProps {
  fields: Field[];
  onApply: (condition: string) => void;
  onClose: () => void;
}

const ConditionalDialog: React.FC<ConditionalDialogProps> = ({
  fields,
  onApply,
  onClose,
}) => {
  const [selectedField, setSelectedField] = useState("");
  const [value, setValue] = useState("");
  const [conditionType, setConditionType] = useState("if");
  const [rawExpression, setRawExpression] = useState(false);

  const conditionTypes = [
    { value: "if", label: "If Condition" },
    { value: "loop", label: "For Each Loop" },
    // { value: "raw", label: "Raw Expression" },
  ];

  const handleApply = () => {
    let condition = "";

    if (rawExpression) {
      // For raw expressions - just wrap in curly braces
      condition = value;
    } else if (conditionType === "if") {
      // For if conditions - using docxtemplater section syntax
      condition = selectedField;
    } else if (conditionType === "loop") {
      // For loops - using docxtemplater loop syntax
      condition = selectedField;
    }

    onApply(condition);
  };

  const isNumericField = (fieldName: string) => {
    const field = fields.find((f) => f.name === fieldName);
    return field?.type === "number";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add Docxtemplater Tag</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Type
            </label>
            <select
              value={conditionType}
              onChange={(e) => {
                setConditionType(e.target.value);
                setRawExpression(e.target.value === "raw");
              }}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {conditionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {!rawExpression && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a field</option>
                {fields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {rawExpression && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expression
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter expression (e.g., #users.name)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter docxtemplater expression including # for sections/loops if
                needed
              </p>
            </div>
          )}

          {conditionType === "if" && !rawExpression && (
            <div className="text-sm text-gray-600">
              <p>
                This will create a section that shows content only if the field
                exists or is true.
              </p>
              <p className="mt-1">
                Example: {`{#${selectedField}}content{/${selectedField}}`}
              </p>
            </div>
          )}

          {conditionType === "loop" && !rawExpression && (
            <div className="text-sm text-gray-600">
              <p>This will create a loop that iterates over the array field.</p>
              <p className="mt-1">
                Example: {`{#${selectedField}}content{/${selectedField}}`}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={
              (!selectedField && !rawExpression) || (rawExpression && !value)
            }
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalDialog;
