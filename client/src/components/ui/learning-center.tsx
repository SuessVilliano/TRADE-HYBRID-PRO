import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Expand, ExternalLink, BookOpen, BookText, GraduationCap, Video } from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'interactive';
  provider: string;
  thumbnail?: string;
  duration?: string;
}

const courses: CourseItem[] = [
  {
    id: 'futures-course',
    title: 'Futures Trading Fundamentals',
    description: 'Learn the fundamentals of futures trading, contract specifications, and risk management strategies',
    url: 'https://my.coursebox.ai/courses/106395/activities/1379853/course_view/',
    type: 'course',
    provider: 'Coursebox',
    duration: '2.5 hours'
  },
  {
    id: 'options-strategies',
    title: 'Options Trading Strategies',
    description: 'Master advanced options strategies for any market condition',
    url: 'https://example.com/options-course',
    type: 'video',
    provider: 'TradeHybrid Academy',
    duration: '3 hours'
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis Mastery',
    description: 'Learn chart patterns, indicators and how to analyze market trends',
    url: 'https://example.com/analysis',
    type: 'course',
    provider: 'TradeHybrid Academy',
    duration: '4 hours'
  }
];

export function LearningCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(course => course.type === activeTab);

  const handleCourseSelect = (course: CourseItem) => {
    setSelectedCourse(course);
  };

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (!isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        
        if (iframeRef.current.requestFullscreen) {
          iframeRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Learning Center</h1>
        </div>

        {!selectedCourse ? (
          <>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
                <TabsTrigger value="course">Courses</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="interactive">Interactive</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {filteredCourses.map((course) => (
                    <Card 
                      key={course.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCourseSelect(course)}
                    >
                      <CardHeader className="p-4 pb-2">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-40 object-cover rounded-md mb-2" 
                          />
                        ) : (
                          <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center mb-2">
                            {course.type === 'video' && <Video className="h-12 w-12 text-muted-foreground" />}
                            {course.type === 'course' && <GraduationCap className="h-12 w-12 text-muted-foreground" />}
                            {course.type === 'article' && <BookText className="h-12 w-12 text-muted-foreground" />}
                            {course.type === 'interactive' && <BookOpen className="h-12 w-12 text-muted-foreground" />}
                          </div>
                        )}
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm">{course.provider}</span>
                            {course.duration && <span className="text-sm">{course.duration}</span>}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <div className="flex items-center text-xs">
                          {course.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                          {course.type === 'course' && <GraduationCap className="h-3 w-3 mr-1" />}
                          {course.type === 'article' && <BookText className="h-3 w-3 mr-1" />}
                          {course.type === 'interactive' && <BookOpen className="h-3 w-3 mr-1" />}
                          <span className="capitalize">{course.type}</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          Open
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-medium">{selectedCourse.title}</h2>
                <p className="text-muted-foreground">{selectedCourse.provider}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Expand className="h-4 w-4 mr-2" />
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedCourse.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                >
                  Back to Courses
                </Button>
              </div>
            </div>
            
            <div className="w-full h-[calc(100vh-220px)] border rounded-md overflow-hidden bg-card">
              <iframe
                ref={iframeRef}
                src={selectedCourse.url}
                title={selectedCourse.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}