import React, { useState, useEffect, SelectHTMLAttributes } from "react";
import "./Select.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  enableSearch?: boolean;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options = [],
  onChange,
  enableSearch = false,
  placeholder = "Select an option",
  ...nativeProps
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>(options);

  useEffect(() => {
    if (enableSearch && searchTerm) {
      setFilteredOptions(
        options.filter((option) =>
          option?.label?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          option?.value?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, enableSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const safeOptions = Array.isArray(filteredOptions) ? filteredOptions : [];

  return (
    <div className="select-container">
      {label && (
        <label htmlFor="select-dropdown" className="select-label">
          {label}
        </label>
      )}
      {enableSearch && (
        <input
          type="text"
          placeholder="Search options..."
          value={searchTerm}
          onChange={handleSearch}
          className="select-search"
        />
      )}
      <div className="select-wrapper">
        <select
          id="select-dropdown"
          onChange={handleChange}
          className="select-dropdown"
          {...nativeProps}
        >
          <option value="">{placeholder}</option>
          {safeOptions.map((option, index) => (
            <option key={`${option.value}-${index}`} value={option.value}>
              {option.label || option.value}
            </option>
          ))}
        </select>
        <div className="select-arrow"></div>
      </div>
    </div>
  );
};

export default Select;
