import axios from 'axios';

// Journal entry type definition
export interface JournalEntry {
  id?: string;
  userId?: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  tradeIds?: string[];
  relatedTrades?: any[];
  symbol?: string;
  timestamp?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  lessons?: string[];
  keyLessonLearned?: string;
  attachments?: string[];
  isPrivate?: boolean;
  mentality?: string;
  currentMood?: number;
  marketState?: string;
}

/**
 * Service for managing trading journal entries
 */
class JournalService {
  private baseApiUrl = '/api';

  /**
   * Get all journal entries for the current user
   */
  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      // Try the unified API endpoint first
      try {
        const response = await axios.get(`${this.baseApiUrl}/journal/entries`);
        console.log('Retrieved journal entries from unified API:', response.data);
        return response.data;
      } catch (unifiedError) {
        console.warn('Failed to fetch from unified API, trying MCP endpoint:', unifiedError);
        
        // Try the MCP API endpoint as fallback
        const userId = localStorage.getItem('userId') || 'current';
        const mcpResponse = await axios.get(`${this.baseApiUrl}/mcp/user/${userId}/journal-entries`);
        
        if (mcpResponse.data && mcpResponse.data.entries) {
          console.log('Retrieved journal entries from MCP API:', mcpResponse.data.entries);
          return mcpResponse.data.entries;
        }
        
        // If we get here, both APIs failed
        console.error('Failed to retrieve journal entries from any endpoint');
        return [];
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  }

  /**
   * Save a new journal entry
   */
  async saveJournalEntry(entry: JournalEntry): Promise<JournalEntry | null> {
    try {
      // Add timestamp if not provided
      const entryWithTimestamp = {
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString()
      };

      // Try the unified API endpoint first
      try {
        const response = await axios.post(`${this.baseApiUrl}/journal/entries`, entryWithTimestamp);
        console.log('Saved journal entry to unified API:', response.data);
        return response.data;
      } catch (unifiedError) {
        console.warn('Failed to save to unified API, trying MCP endpoint:', unifiedError);
        
        // Try the MCP API endpoint as fallback
        const userId = localStorage.getItem('userId') || 'current';
        const mcpResponse = await axios.post(
          `${this.baseApiUrl}/mcp/user/${userId}/journal-entries`, 
          entryWithTimestamp
        );
        
        if (mcpResponse.data && mcpResponse.data.result) {
          console.log('Saved journal entry to MCP API:', mcpResponse.data.result);
          return mcpResponse.data.result;
        }
        
        // If we get here, let's try one more option - the learning journal
        try {
          console.warn('Trying learning journal API as last resort');
          const learningResponse = await axios.post(
            `${this.baseApiUrl}/learning/journal`, 
            {
              title: entry.title || 'Journal Entry',
              content: entry.content,
              tags: entry.tags?.join(',') || ''
            }
          );
          
          if (learningResponse.data && learningResponse.data.success) {
            console.log('Saved to learning journal API:', learningResponse.data);
            // Now retrieve it to return
            const entries = await this.getJournalEntries();
            return entries[0] || null;
          }
        } catch (learningError) {
          console.error('All journal save endpoints failed:', learningError);
        }
      }
      
      // If we get here, all APIs failed
      console.error('Failed to save journal entry to any endpoint');
      return null;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return null;
    }
  }

  /**
   * Update an existing journal entry
   */
  async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<boolean> {
    try {
      const userId = localStorage.getItem('userId') || 'current';
      
      // Try the unified API first
      try {
        const response = await axios.patch(`${this.baseApiUrl}/journal/entries/${entryId}`, updates);
        console.log('Updated journal entry in unified API:', response.data);
        return true;
      } catch (unifiedError) {
        console.warn('Failed to update in unified API, trying MCP endpoint:', unifiedError);
        
        // Try MCP API as fallback
        const mcpResponse = await axios.patch(
          `${this.baseApiUrl}/mcp/user/${userId}/journal-entries/${entryId}`, 
          updates
        );
        
        if (mcpResponse.data && mcpResponse.data.status === 'success') {
          console.log('Updated journal entry in MCP API:', mcpResponse.data);
          return true;
        }
        
        // Try learning journal API as last resort
        try {
          const learningResponse = await axios.put(
            `${this.baseApiUrl}/learning/journal/${entryId}`, 
            {
              title: updates.title,
              content: updates.content,
              tags: updates.tags?.join(',')
            }
          );
          
          if (learningResponse.data && learningResponse.data.success) {
            console.log('Updated in learning journal API:', learningResponse.data);
            return true;
          }
        } catch (learningError) {
          console.error('All journal update endpoints failed:', learningError);
        }
      }
      
      // If we get here, all APIs failed
      console.error('Failed to update journal entry in any endpoint');
      return false;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return false;
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(entryId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('userId') || 'current';
      
      // Try unified API first
      try {
        const response = await axios.delete(`${this.baseApiUrl}/journal/entries/${entryId}`);
        console.log('Deleted journal entry from unified API:', response.data);
        return true;
      } catch (unifiedError) {
        console.warn('Failed to delete from unified API, trying MCP endpoint:', unifiedError);
        
        // Try MCP API as fallback
        const mcpResponse = await axios.delete(
          `${this.baseApiUrl}/mcp/user/${userId}/journal-entries/${entryId}`
        );
        
        if (mcpResponse.data && mcpResponse.data.status === 'success') {
          console.log('Deleted journal entry from MCP API:', mcpResponse.data);
          return true;
        }
        
        // Try learning journal API as last resort
        try {
          const learningResponse = await axios.delete(
            `${this.baseApiUrl}/learning/journal/${entryId}`
          );
          
          if (learningResponse.data && learningResponse.data.success) {
            console.log('Deleted from learning journal API:', learningResponse.data);
            return true;
          }
        } catch (learningError) {
          console.error('All journal delete endpoints failed:', learningError);
        }
      }
      
      // If we get here, all APIs failed
      console.error('Failed to delete journal entry from any endpoint');
      return false;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }
}

// Create singleton instance
const journalService = new JournalService();
export default journalService;