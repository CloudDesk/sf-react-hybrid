import React from 'react';
import FileListItem from './FileListItem';
import { FileListProps } from './types/FileTypes';

const FileList: React.FC<FileListProps> = ({ files, onFileSelect }) => {
    if (!files.length) {
        return (
            <div className="p-8 text-center text-gray-500">
                No files available
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {files.map((file) => (
                <FileListItem
                    key={file.id}
                    file={file}
                    onSelect={onFileSelect}
                />
            ))}
        </div>
    );
};

export default FileList;