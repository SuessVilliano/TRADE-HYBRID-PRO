import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { FaUsers, FaCoins, FaChartLine, FaSitemap } from 'react-icons/fa';

interface AffiliateModuleProps {
  className?: string;
}

export function AffiliateModule({ className }: AffiliateModuleProps) {
  // This component serves as an entry point to the affiliate program
  // It can be embedded in various parts of the app to promote the affiliate program
  
  const benefits = [
    {
      icon: <FaUsers className="text-blue-500" />,
      title: "Infinite Spillover",
      description: "Benefit from the recruiting efforts of your entire downline with our infinite spillover system"
    },
    {
      icon: <FaCoins className="text-yellow-500" />,
      title: "Multiple Income Streams",
      description: "Earn commissions from direct referrals and their downlines across multiple levels"
    },
    {
      icon: <FaChartLine className="text-green-500" />,
      title: "Unlimited Growth",
      description: "No caps on your earnings - the matrix expands infinitely as your network grows"
    },
    {
      icon: <FaSitemap className="text-purple-500" />,
      title: "Powerful 2x3 Structure",
      description: "Optimized matrix design ensures maximum earnings with minimal referral requirements"
    }
  ];
  
  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">Trade Hybrid Affiliate Program</CardTitle>
        <CardDescription>
          Earn recurring commissions through our infinite spillover matrix affiliate system
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-slate-700 p-2 rounded">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{benefit.title}</h3>
                <p className="text-xs text-gray-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-500/30 mb-4">
          <h3 className="font-bold text-center text-lg mb-2">
            How It Works:
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0">1</span>
              <span>Join with a one-time fee of 100 THC tokens</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0">2</span>
              <span>Share your affiliate link to invite others to the platform</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0">3</span>
              <span>Build your network and benefit from infinite spillover</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0">4</span>
              <span>Earn commissions through multiple levels - no limit on depth!</span>
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/affiliate/register">Join Now</Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link to="/affiliate/dashboard">View Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AffiliateModule;