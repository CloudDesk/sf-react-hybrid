import React, { useState, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';

// TypeScript Interfaces
interface SalesforceObject {
    name: string;
    label: string;
}

interface SalesforceField {
    name: string;
    label: string;
}

interface SalesforceMCEEditorProps {
    editorContent: string;
    onChange: (content: string) => void;
    instanceUrl: string;
    accessToken: string;
    fetchObjectsService?: (token: string, instanceUrl: string) => Promise<SalesforceObject[]>;
    fetchFieldsService?: (token: string, instanceUrl: string, objectName: string) => Promise<SalesforceField[]>;
}

const SalesforceMCEEditor: React.FC<SalesforceMCEEditorProps> = ({
    editorContent,
    onChange,
    instanceUrl,
    accessToken,
    fetchObjectsService,
    fetchFieldsService
}) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedText, setSelectedText] = useState<string>('');
    const [salesforceObjects, setSalesforceObjects] = useState<SalesforceObject[]>([]);
    const [selectedObject, setSelectedObject] = useState<SalesforceObject | null>(null);
    const [objectFields, setObjectFields] = useState<SalesforceField[]>([]);
    const editorRef = useRef<{ editor: TinyMCEEditor | null }>({ editor: null });

    // Default fetch objects service (can be overridden)
    const defaultFetchObjectsService = useCallback(async (token: string, instanceUrl: string) => {
        try {
            const response = await fetch('/api/salesforce/objects', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Instance-Url': instanceUrl
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching Salesforce objects:', error);
            return [];
        }
    }, []);

    // Default fetch fields service (can be overridden)
    const defaultFetchFieldsService = useCallback(async (token: string, instanceUrl: string, objectName: string) => {
        try {
            const response = await fetch(`/api/salesforce/objects/${objectName}/fields`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Instance-Url': instanceUrl
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching object fields:', error);
            return [];
        }
    }, []);

    // Fetch Salesforce objects
    const fetchSalesforceObjects = useCallback(async () => {
        const service = fetchObjectsService || defaultFetchObjectsService;
        const objects = await service(accessToken, instanceUrl);
        setSalesforceObjects(objects);
    }, [accessToken, instanceUrl, fetchObjectsService]);

    // Fetch fields for a selected object
    const fetchObjectFields = useCallback(async (objectName: string) => {
        const service = fetchFieldsService || defaultFetchFieldsService;
        const fields = await service(accessToken, instanceUrl, objectName);
        setObjectFields(fields);
    }, [accessToken, instanceUrl, fetchFieldsService]);

    // Handle double-click in editor
    const handleEditorDoubleClick = () => {
        const editor = editorRef.current.editor;
        if (!editor) return;

        const selectedText = editor.selection.getContent({ format: 'text' });

        if (selectedText) {
            setSelectedText(selectedText);
            setIsModalOpen(true);
            fetchSalesforceObjects();
        }
    };

    // Handle object selection
    const handleObjectSelect = (object: SalesforceObject) => {
        setSelectedObject(object);
        fetchObjectFields(object.name);
    };

    // Handle field selection and insert into editor
    const handleFieldSelect = (field: SalesforceField) => {
        const editor = editorRef.current.editor;
        if (!editor || !selectedObject) return;

        // Replace selected text with field reference
        editor.execCommand('mceReplaceContent', false, `{${selectedObject.name}.${field.name}}`);

        // Update parent component with new content
        onChange(editor.getContent());

        // Close modal
        setIsModalOpen(false);
    };

    return (
        <div>
            <Editor
                apiKey='55izg245d7nrz1xterb4jmgwwfxfhoubmdmmyttzii6flpjv'
                onInit={(evt, editor) => {
                    editorRef.current.editor = editor;
                }}
                initialValue={editorContent}
                init={{
                    height: 300,
                    menubar: true,
                    plugins: 'lists link',
                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist',
                    setup: (editor) => {
                        editor.on('dblclick', handleEditorDoubleClick);
                    }
                }}
                onEditorChange={onChange}
            />

            {/* Salesforce Object & Field Selection Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Select Salesforce Object and Field</h2>
                            <button
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Objects Column */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-700">Objects</h3>
                                <div className="space-y-2">
                                    {salesforceObjects.map((obj) => (
                                        <button
                                            key={obj.name}
                                            className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${selectedObject?.name === obj.name
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                            onClick={() => handleObjectSelect(obj)}
                                        >
                                            {obj.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fields Column */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-700">Fields</h3>
                                <div className="space-y-2">
                                    {objectFields.map((field) => (
                                        <button
                                            key={field.name}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                                            onClick={() => handleFieldSelect(field)}
                                        >
                                            {field.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Column */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-700">Preview</h3>
                                {selectedObject && (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm"><strong>Object:</strong> {selectedObject.label}</p>
                                        <p className="text-sm"><strong>Selected Text:</strong> {selectedText}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesforceMCEEditor;