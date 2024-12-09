import React, { useRef, useCallback, useEffect } from "react";
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
import ContextMenu from "./ContextMenu";

interface CKEditorProps {
  editorContent?: string;
  onchange?: (content: string) => void;
  onReady?: (params: {
    editor: any;
    selectedText: string;
    position: { x: number; y: number };
    range: any;
  }) => void;
  instanceUrl: string;
  accessToken: string;
}

const CKEditorComponent: React.FC<CKEditorProps> = ({
  editorContent,
  onchange,
  onReady,
  instanceUrl,
  accessToken,
}: any) => {
  const editorRef = useRef<any>(null);
  const contentRef = useRef(editorContent);
  const [contextMenu, setContextMenu] = React.useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: "",
    range: null,
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
          }
        }
      }
    }, 150),
    [onReady]
  );

  const handleDoubleClick = useCallback((evt: MouseEvent, editor: any) => {
    const selection = editor.model.document.selection;
    const range = selection.getFirstRange();
    console.log(range, "range");

    if (!range.isCollapsed) {
      const selectedText = Array.from(range.getItems())
        .map((item: any) => item.data || "")
        .join("");

      if (selectedText.trim()) {
        setContextMenu({
          isOpen: true,
          position: { x: evt.clientX, y: evt.clientY },
          selectedText,
          range,
        });
      }
    }
  }, []);

  const handleContextMenuSelect = useCallback(
    (action: string, fieldPath?: string) => {
      switch (action) {
        case "salesforce":
          if (editorRef.current && fieldPath && contextMenu.range) {
            editorRef.current.model.change((writer: any) => {
              const selection = editorRef.current.model.document.selection;
              const range = selection.getFirstRange();
              editorRef.current.model.deleteContent(selection);
              const position = range.start;
              writer.insertText(fieldPath, position);
            });
          }
          break;
        case "condition":
          if (editorRef.current && contextMenu.range) {
            editorRef.current.model.change((writer: any) => {
              const selection = editorRef.current.model.document.selection;
              const range = selection.getFirstRange();
              const selectedContent = contextMenu.selectedText;

              // DocxTemplater IF condition format
              const conditionText = `{#${selectedContent}}
Your content here
{/${selectedContent}}`;

              editorRef.current.model.deleteContent(selection);
              const position = range.start;
              writer.insertText(conditionText, position);
            });
          }
          break;
        case "loop":
          if (editorRef.current && contextMenu.range) {
            editorRef.current.model.change((writer: any) => {
              const selection = editorRef.current.model.document.selection;
              const range = selection.getFirstRange();
              const selectedContent = contextMenu.selectedText;

              // DocxTemplater loop format
              const loopText = `{#${selectedContent}}
{.}
{/${selectedContent}}`;

              editorRef.current.model.deleteContent(selection);
              const position = range.start;
              writer.insertText(loopText, position);
            });
          }
          break;
      }
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    },
    [contextMenu]
  );

  // Update handleReady to include double click handler
  const handleReady = useCallback(
    (editor: any) => {
      editorRef.current = editor;

      // Selection change handler
      editor.model.document.selection.on("change", () => {
        handleSelectionChange(editor.model.document.selection, editor);
      });

      // Add double click listener to the editing view's DOM element
      const editorElement = editor.ui.getEditableElement();
      editorElement.addEventListener("dblclick", (evt: MouseEvent) => {
        handleDoubleClick(evt, editor);
      });
    },
    [handleSelectionChange, handleDoubleClick]
  );

  // Update the click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the context menu
      const contextMenuElement = document.querySelector(".context-menu");
      if (
        contextMenuElement &&
        !contextMenuElement.contains(event.target as Node)
      ) {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const CKBOX_TOKEN_URL =
  //   "https://123518.cke-cs.com/token/dev/WPVYy6h3LEwySPr7BucUX1t9cLHKbFumRIzf?limit=10";

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
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: {
            name: "h1",
            styles: {
              "font-size": "2em",
              "font-weight": "bold",
            },
          },
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: {
            name: "h2",
            styles: {
              "font-size": "1.5em",
              "font-weight": "bold",
            },
          },
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: {
            name: "h3",
            styles: {
              "font-size": "1.17em",
              "font-weight": "bold",
            },
          },
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
      ],
    },
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
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
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
            ui: {
              viewportOffset: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          }}
        />

        <div className="context-menu">
          <ContextMenu
            position={contextMenu.position}
            onSelect={handleContextMenuSelect}
            isOpen={contextMenu.isOpen}
            instanceUrl={instanceUrl}
            accessToken={accessToken}
          />
        </div>
      </div>
    </div>
  );
};

export default CKEditorComponent;
