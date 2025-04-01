import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertCircle, 
  AlertTriangle,
  ArrowLeft, 
  ChevronRight, 
  Loader2,
  CheckCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the form schema
const signupFormSchema = z.object({
  accountName: z.string()
    .min(3, {
      message: "Account name must be at least 3 characters.",
    })
    .max(30, {
      message: "Account name must not exceed 30 characters.",
    }),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

const PropFirmChallengeSignup: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountName: "",
      agreeToTerms: false,
    },
  });

  useEffect(() => {
    // Fetch challenge details
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/prop-firm/challenges/${challengeId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Challenge not found');
          } else {
            setError('Failed to load challenge details');
          }
          return;
        }
        
        const data = await response.json();
        setChallenge(data);
        
        // Set a default account name
        if (user) {
          form.setValue('accountName', `${user.username}'s ${data.name}`);
        }
      } catch (err) {
        setError('An error occurred while loading the challenge');
        console.error('Error fetching challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId, form, user]);

  const onSubmit = async (values: SignupFormValues) => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/prop-firm/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: Number(challengeId),
          accountName: values.accountName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign up for challenge');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success!',
        description: 'You have successfully signed up for the challenge.',
        variant: 'default',
      });
      
      // Navigate to the account details page
      navigate(`/prop-firm/accounts/${data.id}`);
    } catch (error) {
      console.error('Error signing up for challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign up for challenge. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading challenge details...</span>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="text-center p-8 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Challenge Not Found</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'The challenge you\'re looking for doesn\'t exist.'}
          </p>
          <Button 
            onClick={() => navigate('/prop-firm')}
            variant="default"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="flex flex-col max-w-3xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/prop-firm')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold">Sign Up for Challenge</h1>
          <p className="text-muted-foreground mt-2">
            Complete this form to begin your trading challenge
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Challenge Details</CardTitle>
              <CardDescription>
                Review the challenge requirements before signing up
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{challenge.name}</h3>
                <p className="text-muted-foreground">{challenge.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium">Account Size</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(challenge.accountSize)}</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium">Duration</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">{challenge.durationDays} days</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Challenge Requirements</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase 1 Profit Target:</span>
                    <span className="font-medium">{formatPercent(challenge.targetProfitPhase1)}</span>
                  </div>
                  
                  {challenge.targetProfitPhase2 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phase 2 Profit Target:</span>
                      <span className="font-medium">{formatPercent(challenge.targetProfitPhase2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maximum Daily Drawdown:</span>
                    <span className="font-medium">{formatPercent(challenge.maxDailyDrawdown)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maximum Total Drawdown:</span>
                    <span className="font-medium">{formatPercent(challenge.maxTotalDrawdown)}</span>
                  </div>
                  
                  {challenge.minTradingDays && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Trading Days:</span>
                      <span className="font-medium">{challenge.minTradingDays} days</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Alert className="bg-amber-50 text-amber-800 border-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Violating any of the drawdown rules will result in automatic challenge failure.
                  Make sure to manage your risk properly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Complete this form to start your challenge
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Trading Challenge" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will be used to identify your account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the terms and conditions
                          </FormLabel>
                          <FormDescription>
                            By accepting, you agree to follow all challenge rules and requirements.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sign Up for Challenge
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phase 1</h3>
                <p className="text-muted-foreground">
                  Reach a {formatPercent(challenge.targetProfitPhase1)} profit target within {challenge.durationDays} days while respecting drawdown limits.
                </p>
              </div>
              
              {challenge.targetProfitPhase2 ? (
                <>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Phase 2</h3>
                    <p className="text-muted-foreground">
                      Complete a second evaluation with a {formatPercent(challenge.targetProfitPhase2)} profit target to prove consistency.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Funded Account</h3>
                    <p className="text-muted-foreground">
                      After passing both phases, receive a funded account with an 80% profit split.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Funded Account</h3>
                    <p className="text-muted-foreground">
                      After passing the challenge, receive a funded account with an 80% profit split.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Payouts</h3>
                    <p className="text-muted-foreground">
                      Request payouts of your profit share at any time after becoming funded.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropFirmChallengeSignup;