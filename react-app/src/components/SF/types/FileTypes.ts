export interface SalesforceFile {
    id: string;
    title: string;
    fileExtension: string;
    versionId: string;
}

export interface CKEditorComponentProps {
    selectedFile: SalesforceFile | null;
}

export interface FileListItemProps {
    file: SalesforceFile;
    onSelect?: (file: SalesforceFile) => void;
}

export interface FileListProps {
    files: SalesforceFile[];
    onFileSelect?: (file: SalesforceFile) => void;
}