import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import constants from './constants/constants';
import { AppContextProvider } from './contexts/AppContextProvider.tsx';

declare global {
  interface Window {
    reactMount: (el: HTMLElement, injectProps: any) => void;
  }
}

interface InjectProps {
  orgId: string;
  userId: string;
}

const Index = ({ injectProps, rootElement }: { injectProps: InjectProps; rootElement: HTMLElement }) => {
  const [loading, setLoading] = useState(true);
  const envConfig = {
    orgId: injectProps.orgId,
    userId: injectProps.userId,
  };
  useEffect(() => {
    
        setLoading(false);
     
  }, []);

  if (loading) {
    return (
      <div className="home-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <MemoryRouter>
      <AppContextProvider appConfig={injectProps} envConfig={envConfig} rootElement={rootElement}>
        <App />
      </AppContextProvider>
    </MemoryRouter>
  );
};

interface MountAppProps {
  el: HTMLElement;
  injectProps: InjectProps;
}

const mountApp = ({ el, injectProps }: MountAppProps) => {
  const root = createRoot(el);
  root.render(<StrictMode><Index injectProps={injectProps} rootElement={el} /></StrictMode>);
};

if (constants?.APP_ENV === 'dev') {
  let localUserId = localStorage.getItem('sfdc-local-user-id');
  let localOrgId = localStorage.getItem('sfdc-local-org-id');

  if (!localUserId) {
    localUserId = `${Math.round(new Date().getTime() + Math.random() * 100)}-sfdc`;
    localStorage.setItem('sfdc-local-user-id', localUserId);
  }

  if (!localOrgId) {
    localOrgId = `${Math.round(new Date().getTime() + Math.random() * 100)}-sfdc`;
    localStorage.setItem('sfdc-local-org-id', localOrgId);
  }

  const root = document.getElementById('root');
  if (root) {
    mountApp({ el: root, injectProps: { orgId: localOrgId, userId: localUserId } });
  }
} else {
  window.reactMount = (el: HTMLElement, injectProps: any) => mountApp({ el, injectProps });
}

