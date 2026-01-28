import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import EmailTriggerPage from '../pages/EmailTriggerPage';

export const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('@BudgetApp:token'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" /> : 
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />

        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <EmailTriggerPage /> : 
            <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};