export interface Position {
  x: number;
  y: number;
}

export interface Field {
  label: string;
  value: string;
}

export interface ContextMenuState {
  isOpen: boolean;
  position: Position;
  selectedText: string;
  range: any;
}

export interface FieldSelectionProps {
  selectedObject: string | null;
  objects: Field[];
  objectFields: Field[];
  filteredFields: Field[];
  searchQuery: string;
  isLoadingFields: boolean;
  onObjectSelect: (value: string) => void;
  onFieldSelect: (value: string) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
} 