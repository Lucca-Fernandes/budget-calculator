const API_URL = 'http://localhost:3001';

export const apiRequest = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('@BudgetApp:token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('@BudgetApp:token');
    window.location.href = '/login';
  }
  
  return response;
};