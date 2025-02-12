import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import AuthTabs from './components/auth/AuthTabs';
import Predict from './pages/Predict';

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthTabs />} />
        <Route path="/register" element={<AuthTabs />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/predict/image" element={<Predict />} />
        <Route path="/predict/:type" element={<Predict />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes; 