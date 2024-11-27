declare module 'ckeditor5' {
  export class ClassicEditor {
    static create(element: HTMLElement, config?: any): Promise<ClassicEditor>;
    destroy(): Promise<void>;
    getData(): string;
    setData(data: string): void;
    model: any;
    editing: any;
    ui: any;
  }

  // Plugin declarations
  export class Essentials {}
  export class Paragraph {}
  export class Bold {}
  export class Italic {}
  export class Underline {}
  export class Strikethrough {}
  export class Heading {}
  export class Font {}
  export class FontFamily {}
  export class FontSize {}
  export class FontColor {}
  export class FontBackgroundColor {}
  export class Alignment {}
  export class List {}
  export class Link {}
  export class BlockQuote {}
  export class Table {}
  export class TableToolbar {}
  export class RemoveFormat {}
  export class Indent {}
  export class IndentBlock {}
  export class TodoList {}
  export class ImageBlock {}
  export class ImageCaption {}
  export class ImageStyle {}
  export class ImageToolbar {}
  export class ImageUpload {}
  export class ImageResize {}
  export class AutoImage {}
  export class Autoformat {}
  export class TextTransformation {}
  export class CloudServices {}
  export class CKBox {}
  export class CKBoxImageEdit {}
  export class PictureEditing {}
  export class MediaEmbed {}
  export class SelectAll {}
  export class AccessibilityHelp {}
  export class Autosave {}
  export class PasteFromOffice {}
  export class TableCaption {}
  export class TableCellProperties {}
  export class TableColumnResize {}
  export class TableProperties {}
  export class ImageInline {}
  export class ImageInsert {}
  export class ImageInsertViaUrl {}
  export class ImageTextAlternative {}
  export class LinkImage {}
  export class ListProperties {}
  export class Undo {}

  // Model types
  export interface Range {
    isCollapsed: boolean;
    end: any;
    start: any;
    getItems(): Iterator<any>;
  }

  export interface Selection {
    getFirstRange(): Range;
    getSelectedElement(): any;
  }

  export interface Model {
    document: {
      selection: Selection;
    };
    change(callback: (writer: any) => void): void;
  }

  export interface Editor {
    model: Model;
    editing: {
      view: {
        document: any;
        domConverter: any;
      };
      mapper: any;
    };
    ui: {
      getEditableElement(): HTMLElement;
    };
  }
}

declare module '@ckeditor/ckeditor5-react' {
  import { ClassicEditor } from 'ckeditor5';
  import React from 'react';

  export interface CKEditorProps {
    editor: typeof ClassicEditor;
    data?: string;
    id?: string;
    onReady?: (editor: ClassicEditor) => void;
    onChange?: (event: any, editor: ClassicEditor) => void;
    onBlur?: (event: any, editor: ClassicEditor) => void;
    onFocus?: (event: any, editor: ClassicEditor) => void;
    onError?: (error: Error, details: any) => void;
    disabled?: boolean;
    config?: any;
  }

  export const CKEditor: React.FC<CKEditorProps>;
} 