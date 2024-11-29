export interface Position {
  x: number;
  y: number;
}

export interface Field {
  label: string;
  value: string;
  type?: string;
  referenceTo?: string;
}

export interface ContextMenuState {
  isOpen: boolean;
  position: Position;
  selectedText: string;
  range: any;
}

export interface ContextMenuProps {
  contextMenu: ContextMenuState;
  activeTab: number;
  selectedObject: string | null;
  objects: Field[];
  objectFields: Field[];
  filteredFields: Field[];
  searchQuery: string;
  isLoadingFields: boolean;
  onTabChange: (index: number) => void;
  onObjectSelect: (objectName: string) => Promise<void>;
  onFieldSelect: (value: string) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  onConditionClick: () => void;
  onLoopClick: () => void;
  onClickAway: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  onFieldPreview: (mergeField: string) => (() => void) | undefined;
  onPreviewChange: (mergeField: string, fieldLabel: string) => void;
  handleContextMenuSelect: (action: string, append?: boolean, fieldPath?: string) => void;
}

export interface FieldSelectionProps {
  selectedObject: string | null;
  objectFields: Field[];
  filteredFields: Field[];
  searchQuery: string;
  isLoadingFields: boolean;
  onObjectSelect: (value: string) => void;
  onFieldSelect: (value: string) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  onFieldPreview: (mergeField: string) => (() => void) | undefined;
  onPreviewChange: (mergeField: string, fieldLabel: string) => void;
} 