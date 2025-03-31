import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLearningStore } from '../../lib/stores/useLearningStore';

// Learning Center Routes
export const LearningRoutes: React.FC = () => {
  // This component will be used to define nested routes
  return <Outlet />;
};

// Navigation component for Learning Center
export const LearningNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="bg-slate-800 p-4 rounded-lg mb-6">
      <nav className="flex flex-wrap gap-4">
        <NavItem to="/learning-center" label="Overview" />
        <NavItem to="/learning-center/courses" label="Courses" />
        <NavItem to="/learning-center/lessons" label="Lessons" />
        <NavItem to="/learning-center/certificates" label="Certificates" />
        <NavItem to="/learning-center/journal" label="Learning Journal" />
      </nav>
    </div>
  );
};

// Navigation Item Component
interface NavItemProps {
  to: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/learning-center' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </Link>
  );
};

// Main Layout Component for Learning Center
export const LearningLayout: React.FC = () => {
  const { fetchCourses, courses, isLoading } = useLearningStore();
  
  useEffect(() => {
    // Load courses on initial render
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Center</h1>
        <p className="text-slate-300">
          Enhance your trading skills with comprehensive courses, lessons, and resources.
        </p>
      </div>
      
      <LearningNav />
      
      <div className="bg-slate-800 rounded-lg p-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3">Loading learning content...</span>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};