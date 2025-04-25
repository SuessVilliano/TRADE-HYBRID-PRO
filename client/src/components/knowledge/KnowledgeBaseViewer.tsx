import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Search, Book, HelpCircle, FileText, Info } from 'lucide-react';

// Knowledge base document types
export enum DocumentType {
  KnowledgeBase = 'knowledge-base',
  Support = 'support-guide',
  Overview = 'platform-overview',
  UserGuide = 'user-guide'
}

// Document metadata
interface DocumentInfo {
  id: DocumentType;
  title: string;
  description: string;
  icon: React.ReactNode;
  filename: string;
}

// Define our available documents
const documents: DocumentInfo[] = [
  {
    id: DocumentType.KnowledgeBase,
    title: 'TradeHybrid Knowledge Base',
    description: 'Core platform information and reference',
    icon: <Book className="h-6 w-6" />,
    filename: 'docs/TradeHybrid_Knowledge_Base.md'
  },
  {
    id: DocumentType.Support,
    title: 'Support Guide',
    description: 'Troubleshooting and common solutions',
    icon: <HelpCircle className="h-6 w-6" />,
    filename: 'docs/TradeHybrid_Support_Guide.md'
  },
  {
    id: DocumentType.Overview,
    title: 'Platform Overview',
    description: 'Architecture and technical details',
    icon: <Info className="h-6 w-6" />,
    filename: 'docs/Trade_Hybrid_Platform_Overview.md'
  },
  {
    id: DocumentType.UserGuide,
    title: 'User Guide',
    description: 'Step-by-step instructions for all features',
    icon: <FileText className="h-6 w-6" />,
    filename: 'docs/Comprehensive_TradeHybrid_Guide.md'
  }
];

// Knowledge Base Document Viewer
const KnowledgeBaseViewer: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Find the current document
  const currentDocument = documents.find(doc => doc.id === documentId);
  
  // Fetch document content
  useEffect(() => {
    if (!currentDocument) {
      if (documentId) {
        setError(`Document not found: ${documentId}`);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch the markdown file
    fetch(`/${currentDocument.filename}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading document:', err);
        setError(`Failed to load document. ${err.message}`);
        setLoading(false);
      });
  }, [documentId, currentDocument]);

  // Handle back navigation
  const handleBack = () => {
    if (!documentId) {
      navigate('/dashboard');
    } else {
      navigate('/knowledge');
    }
  };

  // If no document is selected, show the document list
  if (!documentId) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">TradeHybrid Documentation</h1>
            <p className="text-gray-500">Browse guides and resources</p>
          </div>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents
            .filter(doc => 
              searchTerm === '' || 
              doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(doc => (
              <div 
                key={doc.id}
                onClick={() => navigate(`/knowledge/${doc.id}`)}
                className="border rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-blue-500 mr-4">
                    {doc.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">{doc.title}</h2>
                    <p className="text-gray-500 mt-1">{doc.description}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <p className="text-gray-700 mt-2">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  // Show document content
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentDocument?.title}</h1>
        <button 
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </button>
      </div>
      <div className="prose max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default KnowledgeBaseViewer;