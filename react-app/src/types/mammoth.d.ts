declare module 'mammoth' {
  interface ConversionOptions {
    styleMap?: string[];
    includeDefaultStyleMap?: boolean;
    includeEmbeddedStyleMap?: boolean;
    convertImage?: (image: { contentType: string; buffer: Buffer }) => Promise<{ src: string }>;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    transformDocument?: (element: any) => any;
  }

  interface ConversionResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
      error?: Error;
    }>;
  }

  export function convertToHtml(
    input: Buffer | { arrayBuffer: () => Promise<ArrayBuffer> | ArrayBuffer } | { path: string },
    options?: ConversionOptions
  ): Promise<ConversionResult>;

  export function extractRawText(
    input: Buffer | { arrayBuffer: () => Promise<ArrayBuffer> | ArrayBuffer } | { path: string }
  ): Promise<ConversionResult>;

  export function embedStyleMap(
    input: Buffer | { arrayBuffer: () => Promise<ArrayBuffer> | ArrayBuffer } | { path: string },
    styleMap: string
  ): Promise<Buffer>;
} 