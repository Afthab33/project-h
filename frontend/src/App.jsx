import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppFlow from './routes/AppFlow';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppFlow />} />
          {/* Add other routes as needed */}
        </Routes>
      </AuthProvider>
  );
}

export default App;