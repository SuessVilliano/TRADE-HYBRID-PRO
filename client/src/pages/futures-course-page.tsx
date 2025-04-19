import { AppShell } from '@/components/layout/app-shell';
import { CourseboxEmbed } from '@/components/ui/coursebox-embed';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FuturesCoursePage() {
  const navigate = useNavigate();
  
  return (
    <AppShell>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2" 
            onClick={() => navigate('/learning-center')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Learning Center
          </Button>
          <h1 className="text-2xl font-bold">Futures Trading Fundamentals</h1>
        </div>
        
        <CourseboxEmbed 
          courseUrl="https://my.coursebox.ai/courses/106395/activities/1379853/course_view/"
          title="Futures Trading Fundamentals"
          fullWidth={true}
        />
      </div>
    </AppShell>
  );
}