import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import MobileNavBar from '@/components/MobileNavBar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Gift, CreditCard, Diamond, Video, ArrowRight, AlertCircle } from 'lucide-react';
import { initializePlayStoreBilling, purchaseCredits, showRewardedAd } from '@/services/adService';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreditPackage {
  id: string;
  title: string;
  credits: number;
  price: string;
  productId: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const Credits = () => {
  const { currentUser, userData, updateUserCredits } = useAuth();
  const [isLoadingReward, setIsLoadingReward] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isBillingReady, setBillingReady] = useState(false);
  const [rewardedAdsWatched, setRewardedAdsWatched] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  // For a real app, you would track this in database
  const maxDailyRewardedAds = 3;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Initialize Play Store billing when component mounts
    const setupBilling = async () => {
      try {
        setHasError(false);
        const initialized = await initializePlayStoreBilling();
        setBillingReady(initialized);
        
        if (!initialized) {
          setHasError(true);
          setErrorMessage("Payment service is currently unavailable. Please try again later.");
        }
      } catch (error) {
        console.error('Failed to initialize billing:', error);
        setHasError(true);
        setErrorMessage("Failed to initialize in-app purchases. The service might be temporarily down.");
        toast.error('Payment system unavailable. Please try again later.');
      }
    };
    
    setupBilling();
  }, []);

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      title: 'Starter Pack',
      credits: 100,
      price: '$2.99',
      productId: 'pixel_explorer_100_credits',
      icon: <Coins className="h-10 w-10 text-amber-500" />
    },
    {
      id: 'popular',
      title: 'Popular Pack',
      credits: 500,
      price: '$9.99',
      productId: 'pixel_explorer_500_credits',
      icon: <Gift className="h-10 w-10 text-indigo-500" />,
      popular: true
    },
    {
      id: 'pro',
      title: 'Pro Pack',
      credits: 1200,
      price: '$19.99',
      productId: 'pixel_explorer_1200_credits',
      icon: <Video className="h-10 w-10 text-blue-500" />
    },
    {
      id: 'ultimate',
      title: 'Ultimate Pack',
      credits: 3000,
      price: '$39.99',
      productId: 'pixel_explorer_3000_credits',
      icon: <Diamond className="h-10 w-10 text-purple-500" />
    }
  ];

  const handlePurchase = async (pack: CreditPackage) => {
    if (!currentUser) {
      toast.error('Please login to purchase credits');
      navigate('/login');
      return;
    }
    
    if (!isBillingReady) {
      toast.error('Payment system is currently unavailable. Please try again later.');
      return;
    }
    
    setIsLoading(pack.id);
    
    try {
      // Launch Play Store purchase flow
      const purchaseSuccessful = await purchaseCredits(pack.productId, pack.credits);
      
      if (purchaseSuccessful) {
        // Update user's credits
        await updateUserCredits(pack.credits);
        
        // Record purchase in Supabase
        const purchaseRecord = {
          user_id: currentUser.id,
          product_id: pack.productId,
          credits: pack.credits,
          amount: parseInt(pack.price.replace('$', '')),
          purchase_date: new Date()
        };
        
        await supabase.from('credit_purchases').insert([purchaseRecord]);
        
        toast.success(`You've purchased ${pack.credits} credits!`);
      } else {
        toast.error('Purchase was not completed.');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to complete purchase. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const watchRewardedAd = async () => {
    if (!currentUser) {
      toast.error('Please login to earn credits');
      navigate('/login');
      return;
    }
    
    setIsLoadingReward(true);
    
    try {
      // Show rewarded ad
      const adCompleted = await showRewardedAd();
      
      if (adCompleted) {
        // Reward user with 10 credits
        await updateUserCredits(10);
        
        // Record ad view in Supabase
        const adViewRecord = {
          user_id: currentUser.id,
          credits: 10,
          view_date: new Date()
        };
        
        await supabase.from('ad_views').insert([adViewRecord]);
        
        setRewardedAdsWatched(prev => prev + 1);
        toast.success("You've earned 10 credits from watching an ad!");
      }
    } catch (error) {
      console.error('Rewarded ad failed:', error);
      toast.error('Failed to reward credits. Please try again.');
    } finally {
      setIsLoadingReward(false);
    }
  };

  if (!userData) {
    return null; // Loading state or redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <div className="container px-4 py-4 max-w-5xl">
        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <div className="bg-primary/20 p-4 rounded-full mb-2">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Your Credits</h1>
          <div className="text-4xl font-bold my-2">{userData.credits}</div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Credits are used to download videos. Each video download costs 20 credits.
          </p>
        </div>
        
        {hasError && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment System Unavailable</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {creditPackages.map((pack) => (
            <Card 
              key={pack.id} 
              className={`relative overflow-hidden hover-scale ${pack.popular ? 'border-primary shadow-md' : ''}`}
            >
              {pack.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  Popular
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {pack.icon}
                </div>
                <CardTitle className="text-center">{pack.title}</CardTitle>
                <CardDescription className="text-center">
                  Get {pack.credits} credits
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="text-3xl font-bold mb-2">{pack.price}</div>
                <p className="text-sm text-muted-foreground">
                  {(pack.credits / 20).toFixed(0)} video downloads
                </p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(pack)}
                  disabled={isLoading === pack.id || !isBillingReady || hasError}
                >
                  {isLoading === pack.id ? 'Processing...' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="my-10">
          <h2 className="text-2xl font-bold mb-6">Free Credits</h2>
          
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-amber-500" />
                Watch an Ad
              </CardTitle>
              <CardDescription>
                Watch a short advertisement to earn free credits
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm">
                You can earn <span className="font-bold">10 credits</span> for each rewarded ad you watch.
                There's no daily limit, so you can watch as many ads as you want!
              </p>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={watchRewardedAd}
                disabled={isLoadingReward}
              >
                {isLoadingReward ? 'Loading Ad...' : 'Watch Ad for 10 Credits'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-10 mb-20">
          <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Google Play Store Payments
              </CardTitle>
              <CardDescription>
                All payments are processed securely through Google Play
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-wrap gap-4 justify-center">
              <div className="w-auto h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center px-4">
                Google Play
              </div>
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground text-center px-6">
              All transactions are secure and processed through Google Play Store. By purchasing credits, you agree to our Terms of Service and Privacy Policy.
            </CardFooter>
          </Card>
        </div>
      </div>
      <MobileNavBar />
    </div>
  );
};

export default Credits;
