import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { FileListItemProps } from './types/FileTypes';

const FileListItem: React.FC<FileListItemProps> = ({ file, onSelect }) => {
    const handleClick = () => {
        if (onSelect) {
            onSelect(file);
        }
    };

    // const getFileIcon = () => {
    //     switch (file.fileExtension.toLowerCase()) {
    //         case 'pdf':
    //             return 'far fa-file-pdf';
    //         case 'doc':
    //         case 'docx':
    //             return 'far fa-file-word';
    //         case 'xls':
    //         case 'xlsx':
    //             return 'far fa-file-excel';
    //         default:
    //             return faFile;
    //     }
    // };

    return (
        <div
            className="flex items-center justify-between p-4 mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={handleClick}
        >
            <div className="flex items-center space-x-4">
                <div className="text-gray-500">
                    <FontAwesomeIcon icon={faFile} size="lg" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-800">{file.title}</h3>
                    <p className="text-sm text-gray-500">
                        {file.fileExtension.toUpperCase()} • ID: {file.id.slice(0, 8)}...
                    </p>
                </div>
            </div>
            {/* <button
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                onClick={() => handlePreview()}
            >
                <FontAwesomeIcon icon={faEye} />
            </button> */}
        </div>
    );
};

export default FileListItem;