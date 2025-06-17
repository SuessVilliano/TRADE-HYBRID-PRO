import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLearningStore } from '@/lib/stores/learning-store';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Award, 
  ArrowRight, 
  Clock, 
  BarChart, 
  ChevronRight 
} from 'lucide-react';

// Course category badges with appropriate colors
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  let bgColor = "bg-blue-100 text-blue-800";
  
  switch (category.toLowerCase()) {
    case 'forex':
      bgColor = "bg-green-100 text-green-800";
      break;
    case 'crypto':
      bgColor = "bg-purple-100 text-purple-800";
      break;
    case 'stocks':
      bgColor = "bg-red-100 text-red-800";
      break;
    case 'strategy':
      bgColor = "bg-amber-100 text-amber-800";
      break;
    case 'psychology':
      bgColor = "bg-indigo-100 text-indigo-800";
      break;
    case 'technical analysis':
      bgColor = "bg-teal-100 text-teal-800";
      break;
    default:
      bgColor = "bg-slate-100 text-slate-800";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {category}
    </span>
  );
};

// Course card component
const CourseCard: React.FC<{ 
  id: number; 
  title: string; 
  description: string; 
  category: string; 
  level: string;
  duration: number;
  imageUrl?: string;
  featured?: boolean;
}> = ({ 
  id, 
  title, 
  description, 
  category, 
  level,
  duration,
  imageUrl,
  featured
}) => {
  return (
    <div className={`flex flex-col h-full overflow-hidden rounded-lg border ${featured ? 'border-primary' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="relative">
        {featured && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
              Featured
            </span>
          </div>
        )}
        <div className="h-20 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <div className="flex gap-2 mb-2">
          <CategoryBadge category={category} />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
            {level}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{duration} hours</span>
          </div>
          
          <Link to={`/learning-center/course/${id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              View Course
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main TradeHybrid Academy component
const TradeHybridAcademy: React.FC = () => {
  const { courses, fetchCourses, isLoading, error } = useLearningStore();
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  // Filter courses by category
  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.category.toLowerCase() === filter.toLowerCase());
  
  // Featured courses (marked as featured or first 2 if none marked)
  const featuredCourses = courses.filter(course => course.featured);
  
  // Get unique categories for filter tabs
  const categories = ['all', ...new Set(courses.map(course => course.category.toLowerCase()))];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3">Loading courses...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
        <p>Failed to load courses: {error}</p>
        <Button 
          variant="outline" 
          onClick={() => fetchCourses()} 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trade Hybrid Pro Trader Academy</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-3xl">
          Master the markets with our comprehensive curriculum designed for traders of all levels.
          From fundamentals to advanced strategies, our structured courses will accelerate your trading journey.
        </p>
      </div>
      
      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Courses</h2>
            <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.slice(0, 3).map(course => (
              <CourseCard 
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                category={course.category}
                level={course.level}
                duration={course.duration}
                imageUrl={course.imageUrl}
                featured={true}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Main Course Listing with Category Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Browse Courses by Category</h2>
        
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="mb-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'All Courses' : category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard 
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    category={course.category}
                    level={course.level}
                    duration={course.duration}
                    imageUrl={course.imageUrl}
                    featured={course.featured}
                  />
                ))}
              </div>
              
              {filteredCourses.length === 0 && (
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-6 text-center">
                  <p className="text-slate-600 dark:text-slate-400">No courses found in this category.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Learning Path Section */}
      <div className="mt-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Pro Trader Learning Path</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Follow our structured learning path to become a professional trader. 
              Complete all courses to earn your Pro Trader certification.
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => navigate('/learning-center/course/1')}>
            Start Learning Path
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-700 p-4 rounded-md border border-slate-200 dark:border-slate-600">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 mr-3">
                1
              </div>
              <h3 className="font-medium">Foundations</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn the core concepts and terminology of trading markets.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-700 p-4 rounded-md border border-slate-200 dark:border-slate-600">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 mr-3">
                2
              </div>
              <h3 className="font-medium">Market Structure</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Understand how markets function and identify key price levels.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-700 p-4 rounded-md border border-slate-200 dark:border-slate-600">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-200 mr-3">
                3
              </div>
              <h3 className="font-medium">Technical Analysis</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Master chart patterns and indicators for trade analysis.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-700 p-4 rounded-md border border-slate-200 dark:border-slate-600">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 mr-3">
                4
              </div>
              <h3 className="font-medium">Strategy Engineering</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Develop and backtest your own profitable trading strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeHybridAcademy;