import { Routes, Route } from 'react-router-dom';
import HomePage from '../components/Home/HomePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default AppRoutes; 