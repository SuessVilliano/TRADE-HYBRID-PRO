import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Link } from 'react-router-dom';

export default function LearnEmbedded() {
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [expandedView, setExpandedView] = useState(false);
  
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
      
      <PopupContainer padding className="mb-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/40">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Personalized Crypto Learning Journey</h2>
            <p className="text-slate-300 mb-4">
              Discover our new personalized learning experience tailored to your knowledge level and trading goals.
              Track your progress, earn certificates, and unlock advanced trading features.
            </p>
            <Link to="/learn/journey">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Start Your Learning Journey
              </Button>
            </Link>
          </div>
          <div className="flex-shrink-0">
            <img src="/images/learning-journey-icon.png" alt="Learning Journey" 
              className="w-32 h-32 object-contain rounded-full bg-purple-800/30 p-2 border border-purple-500/40" 
              onError={(e) => {
                // Fallback to a div with text if image doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const div = document.createElement('div');
                div.className = 'w-32 h-32 rounded-full bg-purple-800/30 flex items-center justify-center text-center p-4 border border-purple-500/40';
                div.textContent = 'Learning Journey';
                target.parentNode?.appendChild(div);
              }}
            />
          </div>
        </div>
      </PopupContainer>
      
      <PopupContainer padding className="mb-8">
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