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
    title: 'Trade Hybrid Knowledge Base',
    description: 'Core platform information and reference',
    icon: <Book className="h-6 w-6" />,
    filename: 'TradeHybrid_Knowledge_Base.md'
  },
  {
    id: DocumentType.Support,
    title: 'Support Guide',
    description: 'Troubleshooting and common solutions',
    icon: <HelpCircle className="h-6 w-6" />,
    filename: 'TradeHybrid_Support_Guide.md'
  },
  {
    id: DocumentType.Overview,
    title: 'Platform Overview',
    description: 'Architecture and technical details',
    icon: <Info className="h-6 w-6" />,
    filename: 'Trade_Hybrid_Platform_Overview.md'
  },
  {
    id: DocumentType.UserGuide,
    title: 'User Guide',
    description: 'Step-by-step instructions for all features',
    icon: <FileText className="h-6 w-6" />,
    filename: 'Comprehensive_TradeHybrid_Guide.md'
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
    if (!documentId) {
      // No document selected, just viewing the main list
      setLoading(false);
      return;
    }

    if (!currentDocument) {
      setError(`Document not found: ${documentId}`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Extract just the filename part, removing any directory references
    const fileName = currentDocument.filename.split('/').pop();
    console.log(`Loading document: docs/${fileName}`);

    // Fetch the markdown file
    fetch(`/docs/${fileName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        console.log(`Document loaded, length: ${text.length} characters`);
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
      <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Trade Hybrid Documentation</h1>
            <p className="text-gray-300">Browse guides and resources</p>
          </div>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="border border-gray-700 rounded-lg p-6 cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-blue-400 mr-4">
                    {doc.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">{doc.title}</h2>
                    <p className="text-gray-300 mt-1">{doc.description}</p>
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
      <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-gray-900 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Error</h1>
          </div>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
        <div className="bg-gray-800 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-400">{error}</p>
          <p className="text-gray-300 mt-2">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  // Show document content
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{currentDocument?.title}</h1>
        <button 
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </button>
      </div>
      <div className="prose prose-invert dark:prose-invert max-w-none bg-gray-800 text-gray-100 p-6 rounded-lg shadow-lg">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default KnowledgeBaseViewer;