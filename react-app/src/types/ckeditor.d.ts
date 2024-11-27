declare module '@ckeditor/ckeditor5-core' {
    export interface EditorConfig {
        toolbar?: {
            shouldNotGroupWhenFull?: boolean;
            items?: string[];
        };
        fontFamily?: {
            supportAllValues?: boolean;
            options?: string[];
        };
        fontSize?: {
            options?: (number | string)[];
            supportAllValues?: boolean;
        };
        table?: {
            contentToolbar?: string[];
        };
        heading?: {
            options?: Array<{
                model: string;
                view?: string;
                title: string;
                class: string;
            }>;
        };
        placeholder?: string;
        removePlugins?: string[];
        language?: string;
    }
} 