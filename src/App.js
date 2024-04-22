import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Login from './Login';
import PasswordReset from './PasswordReset';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <Router>
      <div>
        <Routes> 
          <Route path="/" element={<Login />} /> 
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
