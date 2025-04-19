import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface CourseboxEmbedProps {
  courseUrl?: string;
  title?: string;
  className?: string;
  fullWidth?: boolean;
}

export function CourseboxEmbed({
  courseUrl = 'https://my.coursebox.ai/courses/106395/activities/1379853/course_view/',
  title = 'Futures Trading Course',
  className = '',
  fullWidth = false
}: CourseboxEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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

  const height = isExpanded ? 'calc(100vh - 180px)' : '500px';
  const width = fullWidth ? '100%' : isExpanded ? '100%' : '800px';
  
  return (
    <Card 
      className={`overflow-hidden transition-all ${className}`} 
      style={{ width, height }}
      ref={cardRef}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpand}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title="Fullscreen"
          >
            <Expand className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(courseUrl, '_blank')}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-48px)]">
        <iframe
          ref={iframeRef}
          src={courseUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </CardContent>
    </Card>
  );
}