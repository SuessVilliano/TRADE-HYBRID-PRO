import React from "react";
import { Link } from "react-router-dom";
import { APIDemo } from "../components/ui/api-demo";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function APIDemoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Trade Hybrid API Demo</h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 py-12 px-8">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">API Integration Showcase</h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              This demo showcases the integration of multiple financial APIs in Trade Hybrid, 
              allowing for real-time market data aggregation and enhanced analysis capabilities.
            </p>
          </div>
          
          <div className="mt-12">
            <APIDemo />
          </div>
          
          <div className="mt-16 max-w-[700px] mx-auto text-sm text-muted-foreground">
            <h3 className="text-xl font-bold mb-4">About This Integration</h3>
            <p className="mb-4">
              Trade Hybrid's API integration system connects to multiple market data providers and brokers 
              to create a comprehensive trading ecosystem. This demo shows just a small portion of our data aggregation 
              capabilities, which power our 3D trading visualizations and AI-driven market analysis.
            </p>
            <p>
              Data is sourced from Alpha Vantage, CNBC, Fidelity, and other providers via RapidAPI, 
              then normalized and enhanced through our aggregation services. The real platform 
              combines these data sources with real-time broker trading capabilities.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 px-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Trade Hybrid. All data provided by external services and used for demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  );
}