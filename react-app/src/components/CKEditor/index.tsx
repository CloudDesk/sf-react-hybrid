import React, { useRef, useCallback, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface CKEditorProps {
  editorContent?: string;
  onchange?: (content: string) => void;
  onReady?: (params: {
    editor: any;
    selectedText: string;
    position: { x: number; y: number };
  }) => void;
  fields: any;
}

const CKEditorComponent: React.FC<CKEditorProps> = React.memo(
  ({ editorContent, onchange, onReady, fields }) => {
    const selectionTimeoutRef = useRef<NodeJS.Timeout>();
    const editorRef = useRef<any>(null);

    // Memoized config to prevent unnecessary re-renders
    const editorConfig = useMemo(
      () => ({
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "bulletedList",
            "numberedList",
          ],
          shouldNotGroupWhenFull: true,
        },
        typing: {
          transformations: {
            include: [],
            remove: ["symbols", "quotes", "typography"],
          },
        },
        removePlugins: [
          "CKFinderUploadAdapter",
          "CKFinder",
          "EasyImage",
          "Image",
          "ImageCaption",
          "ImageStyle",
          "ImageToolbar",
          "ImageUpload",
          "MediaEmbed",
          "Table",
          "TableToolbar",
          "TableProperties",
          "TableCellProperties",
        ],
        placeholder: "Type or paste your content here!",
      }),
      []
    );

    const handleReady = useCallback(
      (editor: any) => {
        editorRef.current = editor;

        const handleMouseUp = () => {
          if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
          }

          selectionTimeoutRef.current = setTimeout(() => {
            if (!editor.model) return;

            const selection = editor.model.document.selection;
            if (!selection) return;

            const range = selection.getFirstRange();
            if (!range || range.isCollapsed || !onReady) return;

            const selectedText = Array.from(range.getItems())
              .map((item: any) => item.data || "")
              .join("");

            if (!selectedText) return;

            const viewRange = editor.editing.mapper.toViewRange(range);
            const domRange =
              editor.editing.view.domConverter.viewRangeToDom(viewRange);
            const rect = domRange.getBoundingClientRect();

            onReady({
              editor,
              selectedText,
              position: {
                x: rect.left + rect.width / 2,
                y: rect.bottom,
              },
            });
          }, 300);
        };

        editor.editing.view.document.on("mouseup", handleMouseUp);

        return () => {
          if (editorRef.current) {
            editorRef.current.editing.view.document.off(
              "mouseup",
              handleMouseUp
            );
          }
          if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
          }
        };
      },
      [onReady]
    );

    // Debounced change handler to reduce unnecessary re-renders
    const handleChange = useCallback(
      (_event: any, editor: any) => {
        // Only update if onchange is provided
        if (onchange) {
          // Use requestAnimationFrame to optimize performance
          requestAnimationFrame(() => {
            const data = editor.getData();
            onchange(data);
          });
        }
      },
      [onchange]
    );

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <CKEditor
          editor={ClassicEditor}
          data={editorContent}
          onReady={handleReady}
          onChange={handleChange}
          config={editorConfig}
        />
      </div>
    );
  }
);

export default CKEditorComponent;
