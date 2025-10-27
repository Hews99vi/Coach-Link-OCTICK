import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RequestForm from './components/RequestForm';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RequestForm />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
