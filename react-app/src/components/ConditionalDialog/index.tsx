import React, { useState, useMemo, useCallback } from "react";
import type { Field } from "../SF";

// Simplified condition types without raw expression
type ConditionType = "if" | "loop" | "format";
type FormatType = "date" | "currency" | "text" | "";
type DateFormat = (typeof DATE_FORMATS)[number]["value"] | "";
type CurrencyLocale = (typeof CURRENCY_LOCALES)[number]["value"];
type CurrencyCode = (typeof CURRENCY_CODES)[number]["code"];

interface SelectOption {
  value: string;
  label: string;
}

interface CurrencyLocaleOption extends SelectOption {
  symbol: string;
}

interface CurrencyCodeOption {
  code: string;
  name: string;
}

// Updated condition types without raw
const CONDITION_TYPES: SelectOption[] = [
  { value: "if", label: "If Condition" },
  { value: "loop", label: "For Each Loop" },
  { value: "format", label: "Format Value" },
];

// Extended date formats with more options
const DATE_FORMATS: SelectOption[] = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g., 03/15/2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g., 15/03/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g., 2024-03-15)" },
  { value: "MMMM DD, YYYY", label: "MMMM DD, YYYY (e.g., March 15, 2024)" },
  { value: "DD MMMM YYYY", label: "DD MMMM YYYY (e.g., 15 March 2024)" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY (e.g., Mar 15, 2024)" },
  { value: "DD MMM YY", label: "DD MMM YY (e.g., 15 Mar 24)" },
  { value: "MM-DD-YY", label: "MM-DD-YY (e.g., 03-15-24)" },
  { value: "YYYY/MM/DD", label: "YYYY/MM/DD (e.g., 2024/03/15)" },
];

const CURRENCY_LOCALES: CurrencyLocaleOption[] = [
  { value: "en-US", label: "English (US)", symbol: "$" },
  { value: "en-GB", label: "English (UK)", symbol: "£" },
  { value: "de-DE", label: "German", symbol: "€" },
  { value: "fr-FR", label: "French", symbol: "€" },
  { value: "ja-JP", label: "Japanese", symbol: "¥" },
  { value: "zh-CN", label: "Chinese", symbol: "¥" },
  { value: "en-IN", label: "English (India)", symbol: "₹" },
  { value: "en-CA", label: "English (Canada)", symbol: "$" },
  { value: "es-ES", label: "Spanish", symbol: "€" },
];

const CURRENCY_CODES: CurrencyCodeOption[] = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
];

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
  const [selectedField, setSelectedField] = useState<string>("");
  const [conditionType, setConditionType] = useState<ConditionType>("if");
  const [formatType, setFormatType] = useState<FormatType>("");
  const [dateFormat, setDateFormat] = useState<DateFormat>("");
  const [currencyLocale, setCurrencyLocale] = useState<CurrencyLocale>("en-US");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");

  const selectedFieldType = useMemo(
    () => fields.find((f) => f.name === selectedField)?.type || "",
    [fields, selectedField]
  );

  const availableFormatTypes = useMemo(() => {
    const types: { value: FormatType; label: string }[] = [
      { value: "text", label: "Text Format" }, // Default text format option
    ];

    if (selectedFieldType === "datetime" || selectedFieldType === "date") {
      types.push({ value: "date", label: "Date Format" });
    }

    if (selectedFieldType === "currency" || selectedFieldType === "number") {
      types.push({ value: "currency", label: "Currency Format" });
    }

    return types;
  }, [selectedFieldType]);

  const isApplyDisabled = useMemo(() => {
    if (!selectedField) return true;
    if (conditionType === "format") {
      if (formatType === "date") return !dateFormat;
      if (formatType === "currency") return !currencyLocale || !currencyCode;
    }
    return false;
  }, [
    conditionType,
    selectedField,
    formatType,
    dateFormat,
    currencyLocale,
    currencyCode,
  ]);

  const generateCondition = useCallback((): string => {
    if (!selectedField) return "";

    switch (conditionType) {
      case "format":
        if (formatType === "date" && dateFormat) {
          return `${selectedField}|date("${dateFormat}")`;
        }
        if (formatType === "currency") {
          return `${selectedField}|num(${currencyLocale},${currencyCode})`;
        }
        if (formatType === "text") {
          return `${selectedField}|string`;
        }
        return selectedField;
      case "if":
      case "loop":
        return `#${selectedField}`;
      default:
        return selectedField;
    }
  }, [
    conditionType,
    selectedField,
    formatType,
    dateFormat,
    currencyLocale,
    currencyCode,
  ]);

  const handleConditionTypeChange = useCallback((newType: ConditionType) => {
    setConditionType(newType);
    setFormatType("");
    setDateFormat("");
  }, []);

  const handleFieldSelection = useCallback((fieldName: string) => {
    setSelectedField(fieldName);
    setFormatType("");
    setDateFormat("");
  }, []);

  const previewText = useMemo(() => {
    if (!selectedField) return "";

    switch (conditionType) {
      case "if":
      case "loop":
        return `{#${selectedField}}content{/${selectedField}}`;
      case "format":
        if (formatType === "date" && dateFormat) {
          return `{${selectedField}|date("${dateFormat}")}`;
        }
        if (formatType === "currency") {
          return `{${selectedField}|num(${currencyLocale},${currencyCode})}`;
        }
        if (formatType === "text") {
          return `{${selectedField}|string}`;
        }
        return `{${selectedField}}`;
      default:
        return "";
    }
  }, [
    conditionType,
    selectedField,
    formatType,
    dateFormat,
    currencyLocale,
    currencyCode,
  ]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Template Tag</h2>

        <div className="space-y-4">
          {/* Tag Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Type
            </label>
            <select
              value={conditionType}
              onChange={(e) =>
                handleConditionTypeChange(e.target.value as ConditionType)
              }
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {CONDITION_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field
            </label>
            <select
              value={selectedField}
              onChange={(e) => handleFieldSelection(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a field</option>
              {fields.map(({ name, label, type }) => (
                <option key={name} value={name}>
                  {label} ({type})
                </option>
              ))}
            </select>
          </div>

          {/* Format Options */}
          {conditionType === "format" && selectedField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format Type
              </label>
              <select
                value={formatType}
                onChange={(e) => setFormatType(e.target.value as FormatType)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select format type</option>
                {availableFormatTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Format Selection */}
          {formatType === "date" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select date format</option>
                {DATE_FORMATS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Currency Format Options */}
          {formatType === "currency" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Locale
                </label>
                <select
                  value={currencyLocale}
                  onChange={(e) =>
                    setCurrencyLocale(e.target.value as CurrencyLocale)
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {CURRENCY_LOCALES.map(({ value, label, symbol }) => (
                    <option key={value} value={value}>
                      {label} ({symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Code
                </label>
                <select
                  value={currencyCode}
                  onChange={(e) =>
                    setCurrencyCode(e.target.value as CurrencyCode)
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {CURRENCY_CODES.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {code} - {name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Preview Section */}
          {previewText && (
            <div className="text-sm text-gray-600">
              <p>Preview:</p>
              <p className="mt-1 font-mono bg-gray-100 p-2 rounded">
                {previewText}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(generateCondition())}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isApplyDisabled}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalDialog;
