import React, { useState } from "react";

interface SearchModalProps {
  onSelect: (field: string) => void;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fields, setFields] = useState<string[]>([
    "FirstName",
    "LastName",
    "Email",
    "Phone",
  ]);

  const filteredFields = fields.filter((field) =>
    field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal">
      <div className="modal-content">
        <input
          type="text"
          placeholder="Search fields"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ul>
          {filteredFields.map((field) => (
            <li key={field} onClick={() => onSelect(field)}>
              {field}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SearchModal;
