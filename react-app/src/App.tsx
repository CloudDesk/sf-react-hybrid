import { SalesforceProvider } from './contexts/SalesforceContext';
import AppRoutes from './routes';

function App() {
  return (
    <SalesforceProvider>
      <AppRoutes />
    </SalesforceProvider>
  );
}

export default App;
