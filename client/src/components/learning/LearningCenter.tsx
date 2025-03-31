import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../../lib/stores/useLearningStore';
import { Course } from '../../lib/stores/useLearningStore';

const LearningCenter: React.FC = () => {
  const { courses, fetchCourses, isLoading, error } = useLearningStore();
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  
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
      
      // Apply level filter
      if (levelFilter !== 'all' && course.level !== levelFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course Library</h2>
        <p className="text-slate-300">
          Explore our comprehensive trading courses covering crypto, forex, stocks, futures, and general trading knowledge.
        </p>
        <div className="mt-4">
          <a
            href="https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            Listen to Trading Freedom Podcast
          </a>
        </div>
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
            <label htmlFor="level-filter" className="block text-sm font-medium text-slate-400 mb-1">
              Level
            </label>
            <select
              id="level-filter"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
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
                  setLevelFilter('all');
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
    </div>
  );
};

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
  
  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/80 text-white';
      case 'intermediate':
        return 'bg-yellow-500/80 text-white';
      case 'advanced':
        return 'bg-red-500/80 text-white';
      case 'all-levels':
        return 'bg-purple-500/80 text-white';
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
          <span className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(course.level)}`}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
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
            {formatDuration(course.duration)}
          </span>
          <a
            href={`/learning-center/course/${course.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
          >
            View Course
          </a>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;