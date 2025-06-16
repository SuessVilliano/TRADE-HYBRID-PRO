import React from 'react';
import { PropFirmJournal } from '../components/ui/prop-firm-journal';

export default function PropFirmJournalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <PropFirmJournal />
      </div>
    </div>
  );
}