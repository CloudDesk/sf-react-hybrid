import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState } from 'react';

interface CKEditorProps {
    initialContent?: string;
    onChange?: (content: string) => void;
}

const CKEditorComponent: React.FC<CKEditorProps> = ({ initialContent = '', onChange }) => {
    const [editorContent, setEditorContent] = useState(initialContent);

    const handleChange = (_event: any, editor: any) => {
        const data = editor.getData();
        setEditorContent(data);
        if (onChange) {
            onChange(data);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Template Editor</h2>
            <CKEditor
                editor={ClassicEditor}
                data={editorContent}
                onChange={handleChange}
                config={{
                    toolbar: {
                        items: [
                            'heading',
                            '|',
                            'fontFamily',
                            'fontSize',
                            'fontColor',
                            'fontBackgroundColor',
                            '|',
                            'bold',
                            'italic',
                            'underline',
                            'strikethrough',
                            '|',
                            'alignment',
                            '|',
                            'numberedList',
                            'bulletedList',
                            '|',
                            'outdent',
                            'indent',
                            '|',
                            'link',
                            'blockQuote',
                            'insertTable',
                            '|',
                            'undo',
                            'redo'
                        ],
                        shouldNotGroupWhenFull: true
                    },
                    fontSize: {
                        options: [
                            9,
                            10,
                            11,
                            12,
                            13,
                            14,
                            15,
                            16,
                            17,
                            18,
                            19,
                            20,
                            21,
                            23,
                            25,
                            27,
                            29,
                            31,
                            33,
                            35
                        ],
                        supportAllValues: true
                    },
                    fontFamily: {
                        options: [
                            'default',
                            'Arial, Helvetica, sans-serif',
                            'Courier New, Courier, monospace',
                            'Georgia, serif',
                            'Lucida Sans Unicode, Lucida Grande, sans-serif',
                            'Tahoma, Geneva, sans-serif',
                            'Times New Roman, Times, serif',
                            'Trebuchet MS, Helvetica, sans-serif',
                            'Verdana, Geneva, sans-serif'
                        ],
                        supportAllValues: true
                    },
                    fontColor: {
                        columns: 6,
                        documentColors: 12,
                    },
                    fontBackgroundColor: {
                        columns: 6,
                        documentColors: 12,
                    },
                    table: {
                        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                    },
                    heading: {
                        options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
                        ]
                    }
                }}
            />
        </div>
    );
};

export default CKEditorComponent;