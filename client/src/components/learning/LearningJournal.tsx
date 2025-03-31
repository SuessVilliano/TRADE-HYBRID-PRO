import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../../lib/stores/useLearningStore';
import { LearningJournalEntry } from '../../lib/stores/useLearningStore';

const LearningJournal: React.FC = () => {
  const { journalEntries, fetchJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, isLoading, error } = useLearningStore();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showEntryForm, setShowEntryForm] = useState<boolean>(false);
  const [currentEntry, setCurrentEntry] = useState<LearningJournalEntry | null>(null);
  const [entryFormData, setEntryFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  
  // Fetch journal entries on component mount
  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Apply search filter to entries
  const filteredEntries = journalEntries
    .filter(entry => {
      if (!searchTerm) return true;
      
      // Search by title, content, or tags
      const tagsString = entry.tags ? entry.tags.join(' ') : '';
      
      return (
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tagsString.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    // Sort by most recent first
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagsArray = entryFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      if (currentEntry) {
        // Update existing entry
        await updateJournalEntry(currentEntry.id, {
          title: entryFormData.title,
          content: entryFormData.content,
          tags: tagsArray,
        });
      } else {
        // Create new entry
        await createJournalEntry({
          title: entryFormData.title,
          content: entryFormData.content,
          tags: tagsArray,
        });
      }
      
      // Reset form and state
      setEntryFormData({ title: '', content: '', tags: '' });
      setCurrentEntry(null);
      setShowEntryForm(false);
      
      // Refresh entries
      fetchJournalEntries();
    } catch (err) {
      console.error('Error saving journal entry:', err);
    }
  };
  
  // Start editing an entry
  const startEditEntry = (entry: LearningJournalEntry) => {
    setCurrentEntry(entry);
    setEntryFormData({
      title: entry.title,
      content: entry.content,
      tags: entry.tags ? entry.tags.join(', ') : '',
    });
    setShowEntryForm(true);
  };
  
  // Start a new entry
  const startNewEntry = () => {
    setCurrentEntry(null);
    setEntryFormData({ title: '', content: '', tags: '' });
    setShowEntryForm(true);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setCurrentEntry(null);
    setEntryFormData({ title: '', content: '', tags: '' });
    setShowEntryForm(false);
  };
  
  // Handle deleting an entry
  const handleDeleteEntry = async (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        await deleteJournalEntry(entryId);
        fetchJournalEntries();
      } catch (err) {
        console.error('Error deleting journal entry:', err);
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Learning Journal</h2>
          <p className="text-slate-300">
            Document your trading journey, insights, and lessons learned.
          </p>
        </div>
        {!showEntryForm && (
          <button
            onClick={startNewEntry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Entry
          </button>
        )}
      </div>
      
      {/* Entry Form */}
      {showEntryForm && (
        <div className="mb-8 bg-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {currentEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="entry-title" className="block text-sm font-medium text-slate-300 mb-1">
                Title
              </label>
              <input
                id="entry-title"
                type="text"
                value={entryFormData.title}
                onChange={(e) => setEntryFormData({...entryFormData, title: e.target.value})}
                placeholder="Give your entry a title..."
                className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="entry-content" className="block text-sm font-medium text-slate-300 mb-1">
                Content
              </label>
              <textarea
                id="entry-content"
                value={entryFormData.content}
                onChange={(e) => setEntryFormData({...entryFormData, content: e.target.value})}
                placeholder="What did you learn today?"
                className="bg-slate-800 text-white rounded-md px-3 py-2 w-full h-40 resize-y"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="entry-tags" className="block text-sm font-medium text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                id="entry-tags"
                type="text"
                value={entryFormData.tags}
                onChange={(e) => setEntryFormData({...entryFormData, tags: e.target.value})}
                placeholder="e.g. crypto, technical analysis, lesson"
                className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {currentEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Search */}
      {!showEntryForm && (
        <div className="mb-8 bg-slate-700 rounded-lg p-4">
          <div className="max-w-md mx-auto">
            <label htmlFor="search-journal" className="block text-sm font-medium text-slate-400 mb-1">
              Search Journal
            </label>
            <input
              id="search-journal"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, content, or tags..."
              className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
            />
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Journal Entries List */}
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3">Loading journal entries...</span>
        </div>
      ) : (
        <>
          {!showEntryForm && filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredEntries.map((entry) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  onEdit={startEditEntry}
                  onDelete={handleDeleteEntry}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : !showEntryForm && (
            <div className="bg-slate-700 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Journal Entries Found</h3>
              <p className="text-slate-300 mb-6">
                {searchTerm ? 
                  "No entries match your search criteria. Try adjusting your search." : 
                  "You haven't created any journal entries yet. Start documenting your trading journey."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors inline-block mr-4"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={startNewEntry}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition-colors inline-block"
              >
                Create First Entry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Journal Entry Card Component
interface JournalEntryCardProps {
  entry: LearningJournalEntry;
  onEdit: (entry: LearningJournalEntry) => void;
  onDelete: (entryId: number) => void;
  formatDate: (date: Date) => string;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit, onDelete, formatDate }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-slate-600">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{entry.title}</h3>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(entry)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Edit entry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
              title="Delete entry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-sm text-slate-400 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {formatDate(entry.created_at)}
          {entry.created_at.toString() !== entry.updated_at.toString() && (
            <span className="ml-2 text-xs text-slate-500">(edited)</span>
          )}
        </div>
        
        <div className={`prose prose-invert max-w-none ${!expanded && 'line-clamp-3'}`}>
          <p className="text-slate-300">{entry.content}</p>
        </div>
        
        {entry.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <span key={index} className="bg-slate-600 text-slate-300 px-2 py-1 rounded-md text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {(entry.course_id || entry.lesson_id) && (
          <div className="mt-4 text-xs text-slate-400">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              {entry.course_id && <span>Related to Course #{entry.course_id}</span>}
              {entry.lesson_id && <span className="ml-1">(Lesson #{entry.lesson_id})</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningJournal;