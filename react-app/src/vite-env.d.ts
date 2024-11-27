/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SF_CLIENT_ID: string;
  readonly VITE_SF_CLIENT_SECRET: string;
  readonly VITE_SF_USERNAME: string;
  readonly VITE_SF_PASSWORD: string;
  readonly VITE_SF_GRANT_TYPE: string;
  readonly VITE_SF_SECURITY_TOKEN: string;
  readonly VITE_SF_LOGIN_URL: string;
  readonly VITE_SF_AUTH_URI: string;
  readonly VITE_SF_REDIRECT_URI: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
