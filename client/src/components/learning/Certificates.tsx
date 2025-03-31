import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../../lib/stores/useLearningStore';
import { Certificate } from '../../lib/stores/useLearningStore';

const Certificates: React.FC = () => {
  const { certificates, fetchCertificates, isLoading, error } = useLearningStore();
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);
  
  // Apply search filter to certificates
  const filteredCertificates = certificates
    .filter(certificate => {
      if (!searchTerm) return true;
      
      // Search by course title or certificate ID
      return (
        certificate.certificate_id?.toString().includes(searchTerm) ||
        certificate.course_id.toString().includes(searchTerm)
      );
    });

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Certificates</h2>
        <p className="text-slate-300">
          View and download your earned certificates from completed courses.
        </p>
      </div>
      
      {/* Search */}
      <div className="mb-8 bg-slate-700 rounded-lg p-4">
        <div className="max-w-md mx-auto">
          <label htmlFor="search-certificates" className="block text-sm font-medium text-slate-400 mb-1">
            Search Certificates
          </label>
          <input
            id="search-certificates"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course name or certificate ID..."
            className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
          />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Certificates List */}
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3">Loading certificates...</span>
        </div>
      ) : (
        <>
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredCertificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-700 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Certificates Found</h3>
              <p className="text-slate-300 mb-6">
                {searchTerm ? 
                  "No certificates match your search criteria. Try adjusting your search." : 
                  "You haven't earned any certificates yet. Complete courses to earn certificates."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors inline-block"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Certificate Card Component
interface CertificateCardProps {
  certificate: Certificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  // For this mock, we'll generate a course title based on the course_id
  const getCourseTitle = (courseId: number) => {
    const courseTitles: Record<number, string> = {
      1: "Cryptocurrency Trading Fundamentals",
      2: "Advanced Forex Analysis",
      3: "Stock Market Mastery",
      4: "Futures Trading Strategies",
      5: "Technical Analysis for Beginners",
      // Add more as needed
    };
    
    return courseTitles[courseId] || `Course #${courseId}`;
  };
  
  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-slate-600">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold mb-1">{getCourseTitle(certificate.course_id)}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-300 gap-2 sm:gap-4">
              <span>Certificate ID: {certificate.certificate_id || certificate.id}</span>
              <span className="hidden sm:inline">•</span>
              <span>Issued: {formatDate(certificate.issued_at)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={certificate.certificate_url || `#${certificate.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </a>
            <a
              href={certificate.certificate_url || `#download-${certificate.id}`}
              download={`Certificate-${certificate.id}.pdf`}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded transition-colors inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;