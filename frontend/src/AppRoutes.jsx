import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import AuthTabs from './components/auth/AuthTabs';
import Predict from './pages/Predict';
import Guide from './pages/Guide';

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthTabs />} />
        <Route path="/register" element={<AuthTabs />} />
        <Route path="/predict/video" element={<Predict />} />
        <Route path="/predict/image" element={<Predict />} />
        <Route path="/predict/audio" element={<Predict />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes; 