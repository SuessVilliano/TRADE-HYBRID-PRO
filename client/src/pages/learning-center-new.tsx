import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import TradeHybridAcademy from '@/components/learning/TradeHybridAcademy';
import CoursePage from '@/components/learning/CoursePage';
import { useLearningStore } from '@/lib/stores/learning-store';

export default function LearningCenterNewPage() {
  const { view, id } = useParams();
  const navigate = useNavigate();
  const { fetchCourses } = useLearningStore();
  
  useEffect(() => {
    // Load courses data when the component mounts
    fetchCourses();
  }, [fetchCourses]);
  
  // Determine which view to show based on URL params
  const renderContent = () => {
    if (view === 'course' && id) {
      return <CoursePage />;
    }
    
    return <TradeHybridAcademy />;
  };
  
  return (
    <AppShell>
      {renderContent()}
    </AppShell>
  );
}