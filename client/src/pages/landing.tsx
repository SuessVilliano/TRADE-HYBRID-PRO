import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/context/AuthContext';
import { useSolanaAuth } from '../lib/context/SolanaAuthProvider';
import { Podcast, Zap, BookOpen, BarChart4, Briefcase, Shield, Award, PenTool, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const solanaAuth = useSolanaAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-black/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/assets/logo.png" alt="TradeHybrid Logo" className="h-10 mr-3" />
            <h1 className="text-2xl font-bold">TradeHybrid</h1>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#metaverse">Metaverse</NavLink>
            <NavLink href="#trade">Trade</NavLink>
            <NavLink href="#education">Education</NavLink>
            <NavLink href="#membership">Membership</NavLink>
          </div>
          
          <div className="flex space-x-3">
            {isAuthenticated || solanaAuth.walletConnected ? (
              <Link to="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-gray-600">
                    Login
                  </Button>
                </Link>
                <Link to="/wallet">
                  <Button variant="outline" className="border-gray-600">
                    Connect Wallet
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                The Next Generation <span className="text-blue-500">Trading Platform</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
                A revolutionary trading experience that combines prop firm infrastructure, real-time market data, advanced AI tools, and immersive learning environments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                    Start Trading Now
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900/20 text-lg px-8 py-6">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="/assets/platform-preview.png" 
                alt="TradeHybrid Platform" 
                className="rounded-lg shadow-2xl max-w-full"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Briefcase className="h-10 w-10 text-blue-500" />}
              title="Proprietary Trading"
              description="Trade with company capital after passing qualification challenges in futures, forex, and crypto markets."
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-yellow-500" />}
              title="Intelligent Signals"
              description="AI-driven trading signals and market analysis to help you make informed decisions."
            />
            <FeatureCard 
              icon={<BookOpen className="h-10 w-10 text-green-500" />}
              title="Educational Resources"
              description="Comprehensive educational content for traders of all experience levels."
            />
            <FeatureCard 
              icon={<Podcast className="h-10 w-10 text-purple-500" />}
              title="Trading Freedom Podcast"
              description="Expert interviews and insights to improve your trading and financial knowledge."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-red-500" />}
              title="Risk Management"
              description="Advanced tools to protect your capital and optimize your risk/reward ratio."
            />
            <FeatureCard 
              icon={<PenTool className="h-10 w-10 text-indigo-500" />}
              title="Smart Trade Panel"
              description="Execute trades with precision using our intuitive and customizable trade panel."
            />
            <FeatureCard 
              icon={<BarChart4 className="h-10 w-10 text-orange-500" />}
              title="Advanced Analytics"
              description="Track performance metrics and analyze your trading behavior with detailed reports."
            />
            <FeatureCard 
              icon={<Award className="h-10 w-10 text-teal-500" />}
              title="Leaderboards"
              description="Compete with top traders and earn your place in the TradeHybrid community."
            />
          </div>
        </div>
      </section>
      
      {/* Metaverse Section */}
      <section id="metaverse" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trading Metaverse</h2>
              <p className="text-gray-300 mb-8">
                Experience trading in a whole new dimension with our immersive Trading Metaverse environment. 
                Interact with other traders, participate in virtual trading floors, attend live market analysis events, 
                and learn from experts in a 3D virtual world designed to revolutionize how you engage with markets.
              </p>
              <Link to="/metaverse">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Enter Metaverse
                </Button>
              </Link>
            </div>
            <div className="lg:w-1/2 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Metaverse Features</h3>
              <div className="space-y-4">
                <MetaverseFeature 
                  title="3D Interactive Trading Floors"
                  description="Experience real-time market data visualization in 3D"
                  icon="💹"
                />
                <MetaverseFeature 
                  title="Virtual Trading Competitions"
                  description="Compete with traders worldwide in risk-free environments"
                  icon="🏆"
                />
                <MetaverseFeature 
                  title="Live Expert Sessions"
                  description="Join virtual seminars and Q&A with professional traders"
                  icon="👨‍🏫"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trade Section */}
      <section id="trade" className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Advanced Trading Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <TradeFeatureCard 
              title="Smart Trade Panel"
              description="Execute trades with precision using our intuitive and customizable trade panel that integrates seamlessly with your charts."
              icon={<PenTool className="h-8 w-8" />}
              linkUrl="/trading-dashboard"
              linkText="Open Trade Panel"
            />
            <TradeFeatureCard 
              title="Signal Analyzer"
              description="Backtest trading signals against historical data to determine effectiveness and optimize your trading strategies."
              icon={<Zap className="h-8 w-8" />}
              linkUrl="/signals-analyzer"
              linkText="Try Signal Analyzer"
            />
            <TradeFeatureCard 
              title="Custom Indicators"
              description="Access to premium technical indicators and create your own custom indicators to spot unique trading opportunities."
              icon={<BarChart4 className="h-8 w-8" />}
              linkUrl="/trading/indicators"
              linkText="View Indicators"
            />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-bold mb-4">Real-Time Multi-Broker Trading</h3>
              <p className="text-gray-300 mb-6">
                Trade directly through your favorite brokers with our integrated trading dashboard. 
                Execute orders, manage positions, and track performance all from one unified interface 
                with institutional-grade tools previously only available to professionals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/trading-dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Open Trading Dashboard
                  </Button>
                </Link>
                <Link to="/trading-tools">
                  <Button variant="outline" className="border-gray-600">
                    Explore All Tools
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="/assets/charts-dashboard.png" 
                alt="Trading Dashboard" 
                className="rounded-lg shadow-xl border border-gray-700 w-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/600x400/2d3748/e2e8f0?text=Trading+Dashboard";
                }}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Education Section */}
      <section id="education" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Learning Center</h2>
              <p className="text-gray-300 mb-8">
                Accelerate your trading journey with our comprehensive Learning Center. Whether you're a beginner 
                looking to understand market basics or an experienced trader refining advanced strategies, our 
                structured learning paths provide the knowledge you need to succeed in today's markets.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <EducationFeature 
                  title="Structured Learning Paths" 
                  description="Follow step-by-step courses designed for your experience level"
                />
                <EducationFeature 
                  title="Video Tutorials" 
                  description="Visual explanations of complex trading concepts"
                />
                <EducationFeature 
                  title="Interactive Quizzes" 
                  description="Test your knowledge and reinforce your learning"
                />
                <EducationFeature 
                  title="Trading Simulations" 
                  description="Practice in risk-free environments before trading real capital"
                />
              </div>
              <Link to="/learn">
                <Button className="bg-green-600 hover:bg-green-700">
                  Explore Learning Center
                </Button>
              </Link>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="p-1 bg-gray-900">
                  <div className="flex space-x-1.5 px-2 py-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                    Popular Learning Modules
                  </h3>
                  <div className="space-y-3">
                    <LearningModule 
                      title="Technical Analysis Fundamentals" 
                      level="Beginner"
                      lessons={12}
                      progress={100}
                    />
                    <LearningModule 
                      title="Advanced Chart Patterns" 
                      level="Intermediate"
                      lessons={8}
                      progress={65}
                    />
                    <LearningModule 
                      title="Risk Management Strategies" 
                      level="All Levels"
                      lessons={6}
                      progress={30}
                    />
                    <LearningModule 
                      title="Algorithmic Trading Basics" 
                      level="Advanced"
                      lessons={10}
                      progress={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Membership Section */}
      <section id="membership" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Membership Levels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MembershipCard 
              title="Free Membership"
              price="$0"
              features={[
                "Basic Trading Dashboard",
                "Educational Resources",
                "Market News",
                "Community Access"
              ]}
              buttonText="Get Started"
              buttonLink="/register"
              highlighted={false}
            />
            <MembershipCard 
              title="Monthly"
              price="$39.99"
              period="per month"
              features={[
                "Advanced Charts",
                "Smart Trade Panel",
                "Learning Center",
                "Broker Connections",
                "API Access"
              ]}
              buttonText="Subscribe"
              buttonLink="/register?plan=monthly"
              highlighted={false}
            />
            <MembershipCard 
              title="Yearly"
              price="$299.99"
              period="per year"
              features={[
                "Everything in Monthly",
                "Prop Firm Challenges",
                "Copy Trading",
                "2 Months Free"
              ]}
              buttonText="Subscribe"
              buttonLink="/register?plan=yearly"
              highlighted={true}
            />
            <MembershipCard 
              title="Lifetime"
              price="$999.99"
              period="one-time"
              features={[
                "Everything in Yearly",
                "Priority Support",
                "Beta Features Access",
                "Custom Prop Firm Rules"
              ]}
              buttonText="Subscribe"
              buttonLink="/register?plan=lifetime"
              highlighted={false}
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TradeHybrid</h3>
              <p className="text-gray-400 mb-4">
                The next generation trading platform combining prop firm infrastructure, 
                real-time market data, and advanced AI tools.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-blue-400">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-blue-400">Pricing</Link></li>
                <li><Link to="/learn" className="hover:text-blue-400">Learning Center</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link to="/disclaimer" className="hover:text-blue-400">Risk Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
              <p className="text-gray-400">
                Email: support@tradehybrid.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; 2025 TradeHybrid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} className="text-gray-300 hover:text-white transition-colors">
    {children}
  </a>
);

const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const EducationFeature: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
    <h4 className="font-semibold mb-1 flex items-center">
      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
      {title}
    </h4>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const LearningModule: React.FC<{
  title: string;
  level: string;
  lessons: number;
  progress: number;
}> = ({ title, level, lessons, progress }) => (
  <div className="p-3 rounded-md border border-gray-700 bg-gray-800/50">
    <div className="flex justify-between items-start mb-2">
      <h5 className="font-medium text-sm">{title}</h5>
      <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full">{level}</span>
    </div>
    <div className="flex items-center text-xs text-gray-400 mb-2">
      <BookOpen className="h-3.5 w-3.5 mr-1" />
      <span>{lessons} lessons</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
      <div 
        className="bg-green-500 h-1.5 rounded-full" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{progress}% complete</span>
      <Link to="/learn" className="text-green-400 hover:text-green-300">
        {progress === 100 ? 'Completed' : 'Continue'}
      </Link>
    </div>
  </div>
);

const MetaverseFeature: React.FC<{
  title: string;
  description: string;
  icon: string;
}> = ({ title, description, icon }) => (
  <div className="flex items-center space-x-3 p-3 rounded-md bg-gray-700/50 hover:bg-gray-700 transition-colors">
    <div className="h-10 w-10 flex items-center justify-center bg-purple-500/20 rounded-md text-xl">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{title}</h4>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

const TradeFeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  linkUrl: string;
  linkText: string;
}> = ({ title, description, icon, linkUrl, linkText }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors h-full flex flex-col">
    <div className="mb-3 text-blue-500">{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-400 mb-4 flex-grow">{description}</p>
    <Link to={linkUrl} className="inline-block">
      <Button variant="outline" size="sm" className="mt-2 border-blue-500 text-blue-400 hover:bg-blue-900/20">
        {linkText}
      </Button>
    </Link>
  </div>
);

const PodcastEpisode: React.FC<{
  title: string;
  date: string;
  duration: string;
}> = ({ title, date, duration }) => (
  <div className="flex items-center space-x-3 p-3 rounded-md bg-gray-700/50 hover:bg-gray-700 transition-colors">
    <Podcast className="h-8 w-8 text-purple-500 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{title}</h4>
      <div className="flex text-xs text-gray-400 mt-1">
        <span>{date}</span>
        <span className="mx-2">•</span>
        <span>{duration}</span>
      </div>
    </div>
  </div>
);

const MembershipCard: React.FC<{
  title: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  highlighted: boolean;
}> = ({ title, price, period, features, buttonText, buttonLink, highlighted }) => (
  <div className={`rounded-lg overflow-hidden ${highlighted ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/10' : 'border border-gray-700'}`}>
    <div className={`p-6 ${highlighted ? 'bg-blue-900/20' : 'bg-gray-800'}`}>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <div className="flex items-end mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {period && <span className="text-gray-400 ml-1">{period}</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Link to={buttonLink}>
        <Button 
          className={`w-full ${highlighted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  </div>
);

export default LandingPage;