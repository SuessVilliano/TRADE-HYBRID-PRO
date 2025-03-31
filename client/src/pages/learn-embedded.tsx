import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Link } from 'react-router-dom';
import { useLearningStore } from '../lib/stores/useLearningStore';
import { Course } from '../lib/stores/useLearningStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function LearnEmbedded() {
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [expandedView, setExpandedView] = useState(false);
  const [activeTab, setActiveTab] = useState("certification");
  const { courses, fetchCourses, isLoading, error } = useLearningStore();
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  // Apply filters and search to courses
  const filteredCourses = courses
    .filter(course => {
      // Apply category filter
      if (filter !== 'all' && course.category !== filter) {
        return false;
      }
      
      // Apply difficulty filter
      if (difficultyFilter !== 'all' && course.difficulty !== difficultyFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  
  const courseModules = [
    { id: 1, title: "Introduction to Trading", duration: "45 min", level: "Beginner" },
    { id: 2, title: "Technical Analysis Fundamentals", duration: "1.5 hours", level: "Beginner" },
    { id: 3, title: "Chart Patterns and Indicators", duration: "2 hours", level: "Intermediate" },
    { id: 4, title: "Risk Management Strategies", duration: "1 hour", level: "All Levels" },
    { id: 5, title: "Advanced Trading Psychology", duration: "1.5 hours", level: "Advanced" },
    { id: 6, title: "Cryptocurrency Markets", duration: "2 hours", level: "Intermediate" },
  ];
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Trade Hybrid Education Center</h1>
      <p className="text-slate-300 mb-8 max-w-3xl">
        Access our comprehensive trading education resources below covering Futures, Crypto, Crypto futures, 
        Stocks, and Forex trading. Learn at your own pace with our structured curriculum.
      </p>
      
      <Tabs defaultValue="certification" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="certification">Certification Course</TabsTrigger>
          <TabsTrigger value="courses">Course Catalog</TabsTrigger>
          <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="certification">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PopupContainer padding className="h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Trade Hybrid Certification Course</h2>
                    <p className="text-slate-400 mt-1">Official certification program for serious traders</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setExpandedView(true)}>Expand View</Button>
                    <Button size="sm" onClick={() => setIsEmbedOpen(true)}>Start Course</Button>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-md mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-400">Total Duration</div>
                      <div className="font-medium">12 Hours</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Certification</div>
                      <div className="font-medium">Trade Hybrid Certified Trader</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Required Skills</div>
                      <div className="font-medium">Basic market knowledge</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Updated</div>
                      <div className="font-medium">March 2025</div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Course Modules</h3>
                <ul className="space-y-3 mb-6">
                  {courseModules.map(module => (
                    <li key={module.id} className="border border-slate-700 rounded-md p-3">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{module.id}. {module.title}</h4>
                          <div className="text-sm text-slate-400 mt-1">Duration: {module.duration}</div>
                        </div>
                        <span className="bg-slate-700 px-2 py-1 text-xs rounded-full h-fit">
                          {module.level}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="flex justify-center mt-6">
                  <Button onClick={() => setIsEmbedOpen(true)}>
                    Access Full Course
                  </Button>
                </div>
              </PopupContainer>
            </div>
            
            <PopupContainer padding>
              <h3 className="text-xl font-semibold mb-4">Course Benefits</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">Real-world Trading Experience</div>
                    <p className="text-sm text-slate-400">Apply your knowledge directly to live markets</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">Professional Certification</div>
                    <p className="text-sm text-slate-400">Receive a recognized credential in the trading community</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">Community Access</div>
                    <p className="text-sm text-slate-400">Join our exclusive community of certified traders</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">Trading Strategies</div>
                    <p className="text-sm text-slate-400">Learn proven strategies across multiple market types</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">Personal Mentorship</div>
                    <p className="text-sm text-slate-400">Get guidance from experienced trading professionals</p>
                  </div>
                </li>
              </ul>
            </PopupContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <PopupContainer padding>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Course Library</h2>
              <p className="text-slate-300">
                Explore our comprehensive trading courses covering crypto, forex, stocks, futures, and general trading knowledge.
              </p>
            </div>
            
            {/* Filters and Search */}
            <div className="mb-8 bg-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
                  >
                    <option value="all">All Categories</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="forex">Forex</option>
                    <option value="stocks">Stocks</option>
                    <option value="futures">Futures</option>
                    <option value="general">General Trading</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="difficulty-filter" className="block text-sm font-medium text-slate-400 mb-1">
                    Difficulty
                  </label>
                  <select
                    id="difficulty-filter"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-1">
                    Search
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="bg-slate-800 text-white rounded-md px-3 py-2 w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-300">
                <p>{error}</p>
              </div>
            )}
            
            {/* Courses Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3">Loading courses...</span>
              </div>
            ) : (
              <>
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-700 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
                    <p className="text-slate-300 mb-6">
                      No courses match your current filters. Try adjusting your search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setFilter('all');
                        setDifficultyFilter('all');
                        setSearchTerm('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors inline-block"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </PopupContainer>
        </TabsContent>
        
        <TabsContent value="roadmap">
          <PopupContainer padding className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/40">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Personalized Crypto Learning Roadmap</h2>
                <p className="text-slate-300 mb-4">
                  Follow our structured roadmap tailored to your knowledge level and trading goals.
                  Track your progress through a visual learning path, unlock advanced modules, and earn your
                  Crypto Trading Mastery Certificate while building real-world crypto trading skills.
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="bg-purple-900/30 border border-purple-500/40 rounded-md px-3 py-2 flex-1 flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span>Personalized learning path</span>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-500/40 rounded-md px-3 py-2 flex-1 flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span>Skill-based progression</span>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-500/40 rounded-md px-3 py-2 flex-1 flex items-center text-sm">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                    <span>Visual achievement tracking</span>
                  </div>
                </div>
                <Link to="/learn/journey">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Explore Your Personalized Roadmap
                  </Button>
                </Link>
              </div>
              <div className="flex-shrink-0 relative">
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  NEW
                </div>
                <img src="/images/learning-journey-icon.png" alt="Learning Journey" 
                  className="w-40 h-40 object-contain rounded-full bg-purple-800/30 p-2 border border-purple-500/40" 
                  onError={(e) => {
                    // Fallback to a div with text if image doesn't load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const div = document.createElement('div');
                    div.className = 'w-40 h-40 rounded-full bg-purple-800/30 flex items-center justify-center text-center p-4 border border-purple-500/40';
                    div.textContent = 'Crypto Roadmap';
                    target.parentNode?.appendChild(div);
                  }}
                />
              </div>
            </div>
          </PopupContainer>
        </TabsContent>
        
        <TabsContent value="resources">
          <PopupContainer padding>
            <h2 className="text-2xl font-bold mb-4">Additional Educational Resources</h2>
            <p className="mb-4">
              Explore our extensive library of trading materials, videos, and guides to enhance your trading skills.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Trading Basics</Button>
              <Button variant="outline">Advanced Technical Analysis</Button>
              <Button variant="outline">Risk Management</Button>
              <Button variant="outline">Crypto Trading Guides</Button>
              <Button variant="outline">Options Strategies</Button>
              <Button variant="outline">Forex Fundamentals</Button>
            </div>
          </PopupContainer>
        </TabsContent>
      </Tabs>
      
      {/* Course Pop-out Dialog */}
      <Dialog open={isEmbedOpen} onOpenChange={setIsEmbedOpen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Trade Hybrid Certification Course</DialogTitle>
            <DialogDescription>
              Learn at your own pace with our structured curriculum
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md overflow-hidden border h-[calc(100%-80px)] mt-4">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://elearning.builderall.com/course/52786/aaLZMM95/" 
              frameBorder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Expanded View for Full Screen */}
      <Dialog open={expandedView} onOpenChange={setExpandedView}>
        <DialogContent className="max-w-7xl h-[95vh]">
          <DialogHeader>
            <DialogTitle>Course Content - Expanded View</DialogTitle>
          </DialogHeader>
          <div className="rounded-md overflow-hidden border h-[calc(100%-60px)]">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://elearning.builderall.com/course/52786/aaLZMM95/" 
              frameBorder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Course Card Component
interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto':
        return 'bg-blue-500/30 text-blue-300';
      case 'forex':
        return 'bg-green-500/30 text-green-300';
      case 'stocks':
        return 'bg-purple-500/30 text-purple-300';
      case 'futures':
        return 'bg-orange-500/30 text-orange-300';
      case 'general':
        return 'bg-slate-500/30 text-slate-300';
      default:
        return 'bg-gray-500/30 text-gray-300';
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/80 text-white';
      case 'intermediate':
        return 'bg-yellow-500/80 text-white';
      case 'advanced':
        return 'bg-red-500/80 text-white';
      default:
        return 'bg-gray-500/80 text-white';
    }
  };
  
  // Format time
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    
    return `${mins}m`;
  };
  
  // Get placeholder image based on category
  const getCategoryImage = (category: string) => {
    switch (category) {
      case 'crypto':
        return '/images/courses/crypto.jpg';
      case 'forex':
        return '/images/courses/forex.jpg';
      case 'stocks':
        return '/images/courses/stocks.jpg';
      case 'futures':
        return '/images/courses/futures.jpg';
      case 'general':
        return '/images/courses/general.jpg';
      default:
        return '/images/courses/default.jpg';
    }
  };

  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="h-40 bg-slate-600 relative">
        <img
          src={course.image_url || getCategoryImage(course.category)}
          alt={course.title}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.src = getCategoryImage(course.category);
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(course.category)}`}>
            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{course.title}</h3>
        <p className="text-sm text-slate-300 mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {formatDuration(course.estimated_duration)}
          </span>
          <a
            href={`/learn/course/${course.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
          >
            View Course
          </a>
        </div>
      </div>
    </div>
  );
};