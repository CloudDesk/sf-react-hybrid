import { SalesforceProvider } from './contexts/SalesforceContext';
import { TemplateProvider } from './contexts/TemplateContext';
import AppRoutes from './routes';

function App() {
  return (
    <SalesforceProvider>
      <TemplateProvider>
        <AppRoutes />
      </TemplateProvider>
    </SalesforceProvider>
  );
}

export default App;
