import React, { useRef, useCallback, memo, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import debounce from "lodash/debounce";
import {
  ClassicEditor,
  AccessibilityHelp,
  Autoformat,
  AutoImage,
  Autosave,
  BlockQuote,
  Bold,
  CKBox,
  CKBoxImageEdit,
  CloudServices,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  SelectAll,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import ContextMenu from './ContextMenu';
import './styles.css';

interface CKEditorProps {
  editorContent?: string;
  onchange?: (content: string) => void;
  onReady?: (params: {
    editor: any;
    selectedText: string;
    position: { x: number; y: number };
    range: any;
  }) => void;
  fields: any[];
  objects: Array<{ value: string; label: string }>;
  getFields: (objectName: string) => Promise<Array<{ value: string; label: string }>>;
}

const CKEditorComponent: React.FC<CKEditorProps> = ({
  editorContent,
  onchange,
  onReady,
  fields,
  objects = [],
  getFields,
}: any) => {
  const editorRef = useRef<any>(null);
  const contentRef = useRef(editorContent);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // States
  const [contextMenu, setContextMenu] = React.useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: '',
    range: null,
  });
  const [selectedObject, setSelectedObject] = React.useState<string | null>(null);
  const [objectFields, setObjectFields] = React.useState<Array<{ value: string; label: string }>>([]);
  const [filteredFields, setFilteredFields] = React.useState<Array<{ value: string; label: string }>>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoadingFields, setIsLoadingFields] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const debouncedOnChange = useCallback(
    debounce((data: string) => {
      if (onchange && contentRef.current !== data) {
        contentRef.current = data;
        onchange(data);
      }
    }, 300),
    [onchange]
  );

  // Optimize selection handling with debounce
  const handleSelectionChange = useCallback(
    debounce((selection: any, editor: any) => {
      const range = selection.getFirstRange();

      if (!range.isCollapsed && onReady) {
        const selectedText = Array.from(range.getItems())
          .map((item: any) => item.data || "")
          .join("");

        if (selectedText.trim()) {
          // Only trigger for non-empty selections
          const viewRange = editor.editing.mapper.toViewRange(range);
          const domRange =
            editor.editing.view.domConverter.viewRangeToDom(viewRange);

          if (domRange) {
            const rect = domRange.getBoundingClientRect();
            const editorRect = editor.ui
              .getEditableElement()
              .getBoundingClientRect();

            // Calculate position relative to the editor container
            onReady({
              editor,
              selectedText,
              position: {
                x: rect.left + rect.width / 2,
                y: rect.bottom - editorRect.top,
              },
              range: range,
            });
          }
        }
      }
    }, 150),
    [onReady]
  );

  const handleDoubleClick = useCallback((evt: MouseEvent, editor: any) => {
    const selection = editor.model.document.selection;
    const range = selection.getFirstRange();
    
    if (!range.isCollapsed) {
      const selectedText = Array.from(range.getItems())
        .map((item: any) => item.data || '')
        .join('');

      if (selectedText.trim()) {
        // Get editor element dimensions and position
        const editorElement = editor.ui.getEditableElement();
        const editorRect = editorElement.getBoundingClientRect();
        // Calculate center position relative to the editor
        const centerX = editorRect.left + (editorRect.width / 2);
        const centerY = editorRect.top + (editorRect.height / 2);


        setContextMenu({
          isOpen: true,
          position: { x: centerX, y: centerY },
          selectedText,
          range,
        });
      }
    }
  }, []);

  const handleContextMenuSelect = useCallback((action: string, append?: boolean, fieldPath?: string) => {
    switch (action) {
      case 'salesforce':
        if (editorRef.current && fieldPath && contextMenu.range) {
          editorRef.current.model.change((writer: any) => {
            if (append) {
              writer.insertText(fieldPath, contextMenu.range!.end);
            } else {
              writer.insertText(fieldPath, contextMenu.range!);
            }
          });
        }
        break;
      case 'condition':
        if (editorRef.current) {
          editorRef.current.model.change((writer: any) => {
            writer.insertText(
              `{#if ${contextMenu.selectedText}}  {/if}`,
              contextMenu.range
            );
          });
        }
        break;
      case 'loop':
        if (editorRef.current) {
          editorRef.current.model.change((writer: any) => {
            writer.insertText(
              `{#each ${contextMenu.selectedText}}  {/each}`,
              contextMenu.range
            );
          });
        }
        break;
    }
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, [contextMenu]);

  // Update handleReady to include double click handler
  const handleReady = useCallback(
    (editor: any) => {
      editorRef.current = editor;

      // Selection change handler
      editor.model.document.selection.on('change', () => {
        handleSelectionChange(editor.model.document.selection, editor);
      });

      // Add double click listener to the editing view's DOM element
      const editorElement = editor.ui.getEditableElement();
      editorElement.addEventListener('dblclick', (evt: MouseEvent) => {
        handleDoubleClick(evt, editor);
      });
    },
    [handleSelectionChange, handleDoubleClick]
  );

  // Update the click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the context menu
      const contextMenuElement = document.querySelector('.context-menu');
      if (contextMenuElement && !contextMenuElement.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CKBOX_TOKEN_URL =
    "https://123518.cke-cs.com/token/dev/WPVYy6h3LEwySPr7BucUX1t9cLHKbFumRIzf?limit=10";

  const editorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "link",
        "insertImage",
        "insertImageViaUrl",
        "ckbox",
        "mediaEmbed",
        "insertTable",
        "blockQuote",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "outdent",
        "indent",
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Autoformat,
      AutoImage,
      Autosave,
      BlockQuote,
      Bold,
      CKBox,
      CKBoxImageEdit,
      CloudServices,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Paragraph,
      PasteFromOffice,
      PictureEditing,
      SelectAll,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
    ],
    // ckbox: {
    //   tokenUrl: CKBOX_TOKEN_URL,
    // },
    fontFamily: {
      supportAllValues: true,
    },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 22],
      supportAllValues: true,
    },
    image: {
      toolbar: [
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:wrapText",
        "imageStyle:breakText",
        "|",
        "resizeImage",
        "|",
        "ckboxImageEdit",
      ],
    },
    placeholder: "Type or paste your content here!",
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative h-[90vh] flex flex-col">
      <div className="flex-grow overflow-auto">
        <CKEditor
          editor={ClassicEditor}
          data={editorContent}
          onReady={handleReady}
          onChange={(_event: any, editor: any) => {
            const data = editor.getData();
            debouncedOnChange(data);
          }}
          config={{
            ...editorConfig,
            height: '100%'
          }}
        />
      </div>
      <ContextMenu
        contextMenu={contextMenu}
        activeTab={activeTab}
        selectedObject={selectedObject}
        objects={objects}
        objectFields={objectFields}
        filteredFields={filteredFields}
        searchQuery={searchQuery}
        isLoadingFields={isLoadingFields}
        onTabChange={setActiveTab}
        onObjectSelect={async (objectName) => {
          setIsLoadingFields(true);
          setSelectedObject(objectName);
          try {
            const fields = await getFields(objectName);
            setObjectFields(fields);
          } catch (error) {
            console.error('Error fetching fields:', error);
          } finally {
            setIsLoadingFields(false);
          }
        }}
        onFieldSelect={(value) => handleContextMenuSelect('salesforce', false, value)}
        onSearchChange={setSearchQuery}
        onReset={() => {
          setSelectedObject(null);
          setObjectFields([]);
          setFilteredFields([]);
          setSearchQuery('');
        }}
        onConditionClick={() => handleContextMenuSelect('condition')}
        onLoopClick={() => handleContextMenuSelect('loop')}
        menuRef={menuRef}
      />
    </div>
  );
};

export default CKEditorComponent;
