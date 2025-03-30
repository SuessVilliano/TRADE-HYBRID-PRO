import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AffiliateDashboardPage } from '../../components/affiliate/affiliate-dashboard-page';
import AffiliateDashboard from '../../components/affiliate/dashboard';
import RegisterPage from '../../components/affiliate/register-page';

export function AffiliateRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AffiliateDashboardPage />} />
      <Route path="/dashboard" element={<AffiliateDashboard />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default function Affiliate() {
  return <AffiliateRoutes />;
}