import { EditorConfig } from '@ckeditor/ckeditor5-core';

export const editorConfig: EditorConfig = {
  toolbar: {
    shouldNotGroupWhenFull: true,
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'alignment',
      'outdent',
      'indent',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'link',
      'blockQuote',
      'insertTable',
      '|',
      'removeFormat'
    ]
  },
  fontFamily: {
    supportAllValues: true,
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
    ]
  },
  fontSize: {
    options: [
      8,
      10,
      12,
      14,
      'default',
      18,
      20,
      22,
      24,
      26,
      28,
      36
    ],
    supportAllValues: true
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      'tableProperties',
      'tableCellProperties'
    ]
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
    ]
  },
  placeholder: 'Type or paste your content here!',
  removePlugins: ['Title', 'WordCount'],
  language: 'en'
};