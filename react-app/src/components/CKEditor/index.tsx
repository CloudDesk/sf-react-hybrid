import React, { useRef, useCallback, memo, useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import debounce from "lodash/debounce";

import './styles.css';
import ContextMenu from './ContextMenu';

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

interface PreviewState {
  isActive: boolean;
  mergeField: string;
  fieldLabel: string;
  originalContent: string;
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
  const [preview, setPreview] = useState<PreviewState>({
    isActive: false,
    mergeField: '',
    fieldLabel: '',
    originalContent: ''
  });

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
        const viewRange = editor.editing.mapper.toViewRange(range);
        const domRange = editor.editing.view.domConverter.viewRangeToDom(viewRange);
        const editorElement = editor.ui.getEditableElement();
        const editorRect = editorElement.getBoundingClientRect();
        const selectionRect = domRange.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuWidth = 500; // Our context menu width
        const menuHeight = 500; // Our minimum context menu height

        // Calculate initial position (centered on selection)
        let x = selectionRect.left + (selectionRect.width / 2);
        let y = selectionRect.top + (selectionRect.height / 2);

        // Adjust horizontal position to avoid overlay with selection
        if (x + menuWidth > viewportWidth - 20) {
          // Move menu to the left of the selection
          x = Math.max(menuWidth / 2 + 20, selectionRect.left - menuWidth - 20);
        } else if (x - menuWidth < 20) {
          // Move menu to the right of the selection
          x = Math.min(viewportWidth - menuWidth / 2 - 20, selectionRect.right + menuWidth + 20);
        }

        // Adjust vertical position to avoid overlay and ensure visibility
        if (y + menuHeight > viewportHeight - 20) {
          // Move menu above the selection if there's space, otherwise move it to top
          y = selectionRect.top > menuHeight + 40 
            ? selectionRect.top - menuHeight / 2 - 20
            : menuHeight / 2 + 20;
        } else if (y - menuHeight < 20) {
          // Move menu below the selection if there's space, otherwise move it to bottom
          y = selectionRect.bottom + viewportHeight > menuHeight + 40
            ? selectionRect.bottom + menuHeight / 2 + 20
            : viewportHeight - menuHeight / 2 - 20;
        }

        setContextMenu({
          isOpen: true,
          position: { x, y },
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
            // Simply replace the selected text with the merge field
            writer.remove(contextMenu.range);
            writer.insertText(fieldPath, contextMenu.range.start);
          });
        }
        break;
      case 'condition':
        if (editorRef.current && contextMenu.range) {
          editorRef.current.model.change((writer: any) => {
            writer.remove(contextMenu.range);
            writer.insertText(
              `{#if ${contextMenu.selectedText}}  {/if}`,
              contextMenu.range.start
            );
          });
        }
        break;
      case 'loop':
        if (editorRef.current && contextMenu.range) {
          editorRef.current.model.change((writer: any) => {
            writer.remove(contextMenu.range);
            writer.insertText(
              `{#each ${contextMenu.selectedText}}  {/each}`,
              contextMenu.range.start
            );
          });
        }
        break;
    }
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, [contextMenu]);

  // Update handleReady to properly attach the double click event
  const handleReady = useCallback(
    (editor: any) => {
      editorRef.current = editor;
      
      // Selection change handler
      editor.model.document.selection.on('change', () => {
        handleSelectionChange(editor.model.document.selection, editor);
      });

      // Add double click listener directly to the editable element
      const editorElement = editor.ui.getEditableElement();
      if (editorElement) {
        console.log('Adding double click listener'); // Debug log
        editorElement.addEventListener('dblclick', (evt: MouseEvent) => {
          evt.preventDefault(); // Prevent default double click behavior
          evt.stopPropagation(); // Stop event propagation
          handleDoubleClick(evt, editor);
        });
      }
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
        "insertTable",
        "blockQuote",
        "|",
        "bulletedList",
        "numberedList",
        "outdent",
        "indent",
      ],
      shouldNotGroupWhenFull: false,
    },
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

  const handleClickAway = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  const highlightInsertionPoint = useCallback((range: any) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const viewRange = editor.editing.mapper.toViewRange(range);
      const domRange = editor.editing.view.domConverter.viewRangeToDom(viewRange);

      if (domRange) {
        // Create or get highlight marker
        let marker = document.getElementById('insertion-marker');
        if (!marker) {
          marker = document.createElement('div');
          marker.id = 'insertion-marker';
          marker.style.position = 'absolute';
          marker.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'; // blue-500 with opacity
          marker.style.borderLeft = '2px solid rgb(59, 130, 246)';
          marker.style.pointerEvents = 'none';
          marker.style.transition = 'all 0.2s ease';
          document.body.appendChild(marker);
        }

        const rect = domRange.getBoundingClientRect();
        const editorRect = editor.ui.getEditableElement().getBoundingClientRect();

        marker.style.top = `${rect.top}px`;
        marker.style.left = `${rect.left}px`;
        marker.style.height = `${rect.height}px`;
        marker.style.width = `${rect.width || 2}px`; // At least 2px wide for cursor
        marker.style.display = 'block';

        return () => {
          marker.style.display = 'none';
        };
      }
    }
  }, [editorRef]);

  const handleFieldPreview = useCallback((mergeField: string) => {
    if (contextMenu.range) {
      // Show preview marker
      const removeHighlight = highlightInsertionPoint(contextMenu.range);

      // Clean up after a delay or when cancelled
      return () => {
        if (removeHighlight) removeHighlight();
      };
    }
  }, [contextMenu.range, highlightInsertionPoint]);

  const handlePreviewChange = (mergeField: string, fieldLabel: string) => {
    if (editorRef.current && contextMenu.range) {
      const editor = editorRef.current;
      const originalContent = editor.getData();

      // Make the change
      editor.model.change((writer: any) => {
        writer.remove(contextMenu.range);
        writer.insertText(mergeField, contextMenu.range.start);
      });

      // Show confirmation dialog
      setPreview({
        isActive: true,
        mergeField,
        fieldLabel,
        originalContent
      });

      // Add highlight effect
      const viewRange = editor.editing.mapper.toViewRange(contextMenu.range);
      const domRange = editor.editing.view.domConverter.viewRangeToDom(viewRange);
      if (domRange) {
        const highlight = document.createElement('div');
        highlight.className = 'preview-highlight';
        highlight.style.position = 'absolute';
        highlight.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        highlight.style.border = '2px solid rgb(59, 130, 246)';
        const rect = domRange.getBoundingClientRect();
        highlight.style.top = `${rect.top}px`;
        highlight.style.left = `${rect.left}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        document.body.appendChild(highlight);
      }
    }
  };

  const handleConfirmChange = (confirm: boolean) => {
    if (!confirm && preview.originalContent) {
      // Restore original content if not confirmed
      editorRef.current?.setData(preview.originalContent);
    }
    
    // Clean up highlight
    const highlight = document.querySelector('.preview-highlight');
    if (highlight) {
      document.body.removeChild(highlight);
    }

    setPreview({
      isActive: false,
      mergeField: '',
      fieldLabel: '',
      originalContent: ''
    });
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleObjectSelect = async (objectName: string) => {
    setIsLoadingFields(true);
    setSelectedObject(objectName);
    try {
      const fields = await getFields(objectName);
      console.log('Fetched fields:', fields); // Debug log
      setObjectFields(fields);
      setFilteredFields(fields); // Initialize filtered fields with all fields
    } catch (error) {
      console.error('Error fetching fields:', error);
      setObjectFields([]);
      setFilteredFields([]);
    } finally {
      setIsLoadingFields(false);
    }
  };

  // Add a useEffect to handle search filtering
  useEffect(() => {
    if (searchQuery && objectFields.length > 0) {
      const filtered = objectFields.filter(field => 
        field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFields(filtered);
    } else {
      setFilteredFields(objectFields);
    }
  }, [searchQuery, objectFields]);

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
        onObjectSelect={handleObjectSelect}
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
        onClickAway={handleClickAway}
        onFieldPreview={handleFieldPreview}
        onPreviewChange={handlePreviewChange}
        handleContextMenuSelect={handleContextMenuSelect}
        menuRef={menuRef}
      />
      
      {preview.isActive && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
          <div className="mb-3">
            <div className="text-sm text-gray-600">Added field:</div>
            <div className="font-medium">{preview.fieldLabel}</div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => handleConfirmChange(false)}
            >
              Undo
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleConfirmChange(true)}
            >
              Keep Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CKEditorComponent;
