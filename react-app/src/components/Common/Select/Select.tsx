import React, { useState, useEffect, SelectHTMLAttributes } from "react";
import "./Select.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  enableSearch?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  onChange,
  enableSearch = false,
  ...nativeProps
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (enableSearch) {
      setFilteredOptions(
        options.filter((option) =>
          option.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, enableSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="select-container">
      <label htmlFor="select-dropdown" className="select-label">
        {label}
      </label>
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
          <option value="">Select an option</option>
          {filteredOptions?.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="select-arrow"></div>
      </div>
    </div>
  );
};

export default Select;
