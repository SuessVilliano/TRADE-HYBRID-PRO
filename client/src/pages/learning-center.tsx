import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LearningCenter from '../components/learning/LearningCenter';
import Certificates from '../components/learning/Certificates';
import LearningJournal from '../components/learning/LearningJournal';

type TabType = 'courses' | 'certificates' | 'journal';

const LearningCenterPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  
  // Set active tab from URL parameter
  useEffect(() => {
    if (tab) {
      if (['courses', 'certificates', 'journal'].includes(tab)) {
        setActiveTab(tab as TabType);
      } else {
        // Redirect to default tab if invalid tab parameter
        navigate('/learning-center/courses', { replace: true });
      }
    }
  }, [tab, navigate]);
  
  // Handle tab change
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    navigate(`/learning-center/${newTab}`);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Center</h1>
        <p className="text-slate-300">
          Develop your trading skills with our comprehensive educational resources.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-8 border-b border-slate-700">
        <div className="flex space-x-8">
          <button
            onClick={() => handleTabChange('courses')}
            className={`pb-4 relative ${
              activeTab === 'courses'
                ? 'text-blue-500 font-medium'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Courses
            </span>
            {activeTab === 'courses' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"></span>
            )}
          </button>
          
          <button
            onClick={() => handleTabChange('certificates')}
            className={`pb-4 relative ${
              activeTab === 'certificates'
                ? 'text-blue-500 font-medium'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Certificates
            </span>
            {activeTab === 'certificates' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"></span>
            )}
          </button>
          
          <button
            onClick={() => handleTabChange('journal')}
            className={`pb-4 relative ${
              activeTab === 'journal'
                ? 'text-blue-500 font-medium'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Learning Journal
            </span>
            {activeTab === 'journal' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"></span>
            )}
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'courses' && <LearningCenter />}
        {activeTab === 'certificates' && <Certificates />}
        {activeTab === 'journal' && <LearningJournal />}
      </div>
    </div>
  );
};

export default LearningCenterPage;