import React, { useRef, useCallback, memo } from "react";
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
}

const CKEditorComponent: React.FC<CKEditorProps> = ({
  editorContent,
  onchange,
  onReady,
  fields,
}: any) => {
  const editorRef = useRef<any>(null);
  const contentRef = useRef(editorContent);

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

  const handleReady = useCallback(
    (editor: any) => {
      editorRef.current = editor;

      // Use a single event listener for selection changes
      editor.model.document.selection.on("change", () => {
        handleSelectionChange(editor.model.document.selection, editor);
      });
    },
    [handleSelectionChange]
  );

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
    <div className="bg-white rounded-lg shadow-sm p-4">
      <CKEditor
        editor={ClassicEditor}
        data={editorContent}
        onReady={handleReady}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          debouncedOnChange(data);
        }}
        config={editorConfig}
      />
    </div>
  );
};

export default CKEditorComponent;
