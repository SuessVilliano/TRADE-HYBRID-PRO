import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, BookOpen, Layers, Award, ArrowRight, Clock, BarChart, CheckCircle } from 'lucide-react';
import { useLearningStore } from '@/lib/stores/learning-store';
import { Link, useNavigate } from 'react-router-dom';

const levelColorMap = {
  beginner: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  advanced: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
};

const categoryIconMap = {
  foundations: <Layers className="w-5 h-5 mr-2" />,
  technical: <BarChart className="w-5 h-5 mr-2" />,
  strategy: <Trophy className="w-5 h-5 mr-2" />,
  psychology: <BookOpen className="w-5 h-5 mr-2" />,
  crypto: <Trophy className="w-5 h-5 mr-2" />,
  forex: <BarChart className="w-5 h-5 mr-2" />,
  stocks: <BarChart className="w-5 h-5 mr-2" />,
  futures: <BarChart className="w-5 h-5 mr-2" />,
  general: <BookOpen className="w-5 h-5 mr-2" />
};

// Format duration from minutes to hours and minutes
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

// Component for certification track display
const CertificationTrack = () => {
  const { courses, isLoading } = useLearningStore();
  const navigate = useNavigate();
  
  const foundationCourse = courses.find(c => c.title.includes("Foundations"));
  const marketStructureCourse = courses.find(c => c.title.includes("Market Structure"));
  const technicalAnalysisCourse = courses.find(c => c.title.includes("Indicators & Technical"));
  const riskPsychologyCourse = courses.find(c => c.title.includes("Risk Management"));
  const strategyEngineeringCourse = courses.find(c => c.title.includes("Strategy Engineering"));
  const cryptoCourse = courses.find(c => c.title.includes("Crypto Proficiency"));
  const forexCourse = courses.find(c => c.title.includes("Forex Mastery"));
  
  const handleCourseClick = (courseId: number) => {
    navigate(`/learning-center/course/${courseId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading certification track...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Trade Hybrid Pro Trader Certification</h2>
        <p className="text-slate-300 mb-4">
          Complete our structured learning path to earn professional trader certifications.
          Each module builds on the previous one, developing your skills systematically.
        </p>
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-amber-400" />
          <span className="font-medium">HCT-1 to HCT-3 Certification Levels Available</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Foundation Course - Module 1 */}
        {foundationCourse && (
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleCourseClick(foundationCourse.id)}>
            <div className="absolute top-0 right-0 h-full w-1 bg-green-500 group-hover:w-2 transition-all"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1.5">
                    <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 1</Badge>
                    <Badge className={levelColorMap[foundationCourse.level as keyof typeof levelColorMap]}>
                      {foundationCourse.level.charAt(0).toUpperCase() + foundationCourse.level.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                    {foundationCourse.title}
                  </CardTitle>
                </div>
                <Badge className="bg-green-600 text-white">HCT-1</Badge>
              </div>
              <CardDescription className="text-slate-300 mt-1">
                {foundationCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {foundationCourse.learningOutcomes?.slice(0, 3).map((outcome, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <div className="flex items-center text-slate-400">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{formatDuration(foundationCourse.duration)}</span>
              </div>
              <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Market Structure Course - Module 2 */}
        {marketStructureCourse && (
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleCourseClick(marketStructureCourse.id)}>
            <div className="absolute top-0 right-0 h-full w-1 bg-blue-500 group-hover:w-2 transition-all"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1.5">
                    <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 2</Badge>
                    <Badge className={levelColorMap[marketStructureCourse.level as keyof typeof levelColorMap]}>
                      {marketStructureCourse.level.charAt(0).toUpperCase() + marketStructureCourse.level.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                    {marketStructureCourse.title}
                  </CardTitle>
                </div>
                <Badge className="bg-blue-600 text-white">HCT-1 Advanced</Badge>
              </div>
              <CardDescription className="text-slate-300 mt-1">
                {marketStructureCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {marketStructureCourse.learningOutcomes?.slice(0, 3).map((outcome, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <div className="flex items-center text-slate-400">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{formatDuration(marketStructureCourse.duration)}</span>
              </div>
              <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Technical Analysis Course - Module 3 */}
        {technicalAnalysisCourse && (
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleCourseClick(technicalAnalysisCourse.id)}>
            <div className="absolute top-0 right-0 h-full w-1 bg-indigo-500 group-hover:w-2 transition-all"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1.5">
                    <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 3</Badge>
                    <Badge className={levelColorMap[technicalAnalysisCourse.level as keyof typeof levelColorMap]}>
                      {technicalAnalysisCourse.level.charAt(0).toUpperCase() + technicalAnalysisCourse.level.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                    {technicalAnalysisCourse.title}
                  </CardTitle>
                </div>
                <Badge className="bg-indigo-600 text-white">HCT-2</Badge>
              </div>
              <CardDescription className="text-slate-300 mt-1">
                {technicalAnalysisCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {technicalAnalysisCourse.learningOutcomes?.slice(0, 3).map((outcome, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <div className="flex items-center text-slate-400">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{formatDuration(technicalAnalysisCourse.duration)}</span>
              </div>
              <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Risk & Psychology Course - Module 4 */}
        {riskPsychologyCourse && (
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleCourseClick(riskPsychologyCourse.id)}>
            <div className="absolute top-0 right-0 h-full w-1 bg-cyan-500 group-hover:w-2 transition-all"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1.5">
                    <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 4</Badge>
                    <Badge className={levelColorMap[riskPsychologyCourse.level as keyof typeof levelColorMap]}>
                      {riskPsychologyCourse.level.charAt(0).toUpperCase() + riskPsychologyCourse.level.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                    {riskPsychologyCourse.title}
                  </CardTitle>
                </div>
                <Badge className="bg-cyan-600 text-white">HCT-2 Advanced</Badge>
              </div>
              <CardDescription className="text-slate-300 mt-1">
                {riskPsychologyCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {riskPsychologyCourse.learningOutcomes?.slice(0, 3).map((outcome, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-cyan-500 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <div className="flex items-center text-slate-400">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{formatDuration(riskPsychologyCourse.duration)}</span>
              </div>
              <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Strategy Engineering Course - Module 5 */}
        {strategyEngineeringCourse && (
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleCourseClick(strategyEngineeringCourse.id)}>
            <div className="absolute top-0 right-0 h-full w-1 bg-amber-500 group-hover:w-2 transition-all"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1.5">
                    <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 5</Badge>
                    <Badge className={levelColorMap[strategyEngineeringCourse.level as keyof typeof levelColorMap]}>
                      {strategyEngineeringCourse.level.charAt(0).toUpperCase() + strategyEngineeringCourse.level.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                    {strategyEngineeringCourse.title}
                  </CardTitle>
                </div>
                <Badge className="bg-amber-600 text-white">HCT-2 Pro</Badge>
              </div>
              <CardDescription className="text-slate-300 mt-1">
                {strategyEngineeringCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {strategyEngineeringCourse.learningOutcomes?.slice(0, 3).map((outcome, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <div className="flex items-center text-slate-400">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{formatDuration(strategyEngineeringCourse.duration)}</span>
              </div>
              <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Specialization Tracks - Module 6 */}
        <div className="pt-4">
          <h3 className="text-xl font-semibold mb-4">Specialization Tracks (Module 6)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Forex Track */}
            {forexCourse && (
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer group" onClick={() => handleCourseClick(forexCourse.id)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 6A</Badge>
                        <Badge className={levelColorMap[forexCourse.level as keyof typeof levelColorMap]}>
                          {forexCourse.level.charAt(0).toUpperCase() + forexCourse.level.slice(1)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                        {forexCourse.title}
                      </CardTitle>
                    </div>
                    <Badge className="bg-purple-600 text-white">HCT-3 Forex</Badge>
                  </div>
                  <CardDescription className="text-slate-300 mt-1">
                    {forexCourse.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center text-slate-400">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span className="text-sm">{formatDuration(forexCourse.duration)}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Crypto Track */}
            {cryptoCourse && (
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer group" onClick={() => handleCourseClick(cryptoCourse.id)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Badge className="bg-slate-600 text-xs px-2 mr-2">MODULE 6B</Badge>
                        <Badge className={levelColorMap[cryptoCourse.level as keyof typeof levelColorMap]}>
                          {cryptoCourse.level.charAt(0).toUpperCase() + cryptoCourse.level.slice(1)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                        {cryptoCourse.title}
                      </CardTitle>
                    </div>
                    <Badge className="bg-orange-600 text-white">HCT-3 Crypto</Badge>
                  </div>
                  <CardDescription className="text-slate-300 mt-1">
                    {cryptoCourse.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center text-slate-400">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span className="text-sm">{formatDuration(cryptoCourse.duration)}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Start Learning <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for individual courses
const CoursesGrid = () => {
  const { courses, fetchCourses, isLoading } = useLearningStore();
  const [category, setCategory] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (courses.length === 0) {
      fetchCourses();
    }
  }, [courses.length, fetchCourses]);
  
  // Filter courses based on selected filters
  const filteredCourses = courses.filter(course => {
    if (category !== 'all' && course.category !== category) return false;
    if (level !== 'all' && course.level !== level) return false;
    return true;
  });
  
  const handleCourseClick = (courseId: number) => {
    navigate(`/learning-center/course/${courseId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading courses...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={category === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('all')}
          >
            All
          </Button>
          <Button 
            variant={category === 'foundations' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('foundations')}
          >
            Foundations
          </Button>
          <Button 
            variant={category === 'technical' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('technical')}
          >
            Technical
          </Button>
          <Button 
            variant={category === 'psychology' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('psychology')}
          >
            Psychology
          </Button>
          <Button 
            variant={category === 'strategy' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('strategy')}
          >
            Strategy
          </Button>
          <Button 
            variant={category === 'crypto' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('crypto')}
          >
            Crypto
          </Button>
          <Button 
            variant={category === 'forex' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategory('forex')}
          >
            Forex
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={level === 'all' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setLevel('all')}
          >
            All Levels
          </Button>
          <Button 
            variant={level === 'beginner' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setLevel('beginner')}
          >
            Beginner
          </Button>
          <Button 
            variant={level === 'intermediate' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setLevel('intermediate')}
          >
            Intermediate
          </Button>
          <Button 
            variant={level === 'advanced' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setLevel('advanced')}
          >
            Advanced
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => (
          <Card 
            key={course.id}
            className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer h-full flex flex-col"
            onClick={() => handleCourseClick(course.id)}
          >
            {course.imageUrl && (
              <div className="w-full h-40 overflow-hidden">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                />
              </div>
            )}
            
            <CardHeader className="pb-2 flex-grow">
              <div className="flex items-center justify-between mb-2">
                <Badge className={levelColorMap[course.level as keyof typeof levelColorMap]}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                {course.certification && (
                  <Badge className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30">
                    <Trophy className="w-3 h-3 mr-1" /> Certification
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="text-slate-300 mt-1.5">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="pt-2 flex justify-between mt-auto">
              <div className="flex items-center text-slate-400">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{formatDuration(course.duration)}</span>
              </div>
              <div className="flex items-center">
                {categoryIconMap[course.category as keyof typeof categoryIconMap]}
                <span className="text-sm capitalize">{course.category}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No courses found</h3>
          <p className="text-slate-400 max-w-md">
            No courses match your selected filters. Try changing your category or level filters.
          </p>
        </div>
      )}
    </div>
  );
};

// Main Trade Hybrid Academy component
export default function TradeHybridAcademy() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trade Hybrid Pro Trader Academy</h1>
        <p className="text-slate-300">
          Master the markets with our comprehensive trader education curriculum. From foundational concepts to specialized strategies.
        </p>
      </div>
      
      <Tabs defaultValue="certification" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="certification" className="text-base px-4 py-2">
            <Trophy className="w-4 h-4 mr-2" /> Certification Track
          </TabsTrigger>
          <TabsTrigger value="all-courses" className="text-base px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" /> All Courses
          </TabsTrigger>
          <TabsTrigger value="my-progress" className="text-base px-4 py-2">
            <BarChart className="w-4 h-4 mr-2" /> My Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="certification" className="mt-0">
          <CertificationTrack />
        </TabsContent>
        
        <TabsContent value="all-courses" className="mt-0">
          <CoursesGrid />
        </TabsContent>
        
        <TabsContent value="my-progress" className="mt-0">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <BarChart className="h-16 w-16 text-slate-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Progress Tracking Coming Soon</h3>
            <p className="text-slate-400 max-w-md">
              We're building a comprehensive progress tracking system to help you monitor your learning journey.
            </p>
            <Link to="/learning-center/certification-track">
              <Button className="mt-4">
                Start Certification Track
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}