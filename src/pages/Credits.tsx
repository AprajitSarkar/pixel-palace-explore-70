
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import MobileNavBar from '@/components/MobileNavBar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Gift, CreditCard, ArrowRight } from 'lucide-react';

const Credits = () => {
  const { currentUser, userData, updateUserCredits } = useAuth();
  const [isLoadingReward, setIsLoadingReward] = useState(false);
  const [rewardedAdsWatched, setRewardedAdsWatched] = useState(0);
  const navigate = useNavigate();

  // For a real app, you would track this in Firestore
  const maxDailyRewardedAds = 3;

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const watchRewardedAd = async () => {
    if (rewardedAdsWatched >= maxDailyRewardedAds) {
      toast.error("You've reached your daily limit for rewarded ads");
      return;
    }
    
    setIsLoadingReward(true);
    
    try {
      // In a real app, this would show an actual rewarded ad
      console.log("Showing rewarded ad...");
      
      // Simulate ad viewing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Award credits
      await updateUserCredits(20);
      
      setRewardedAdsWatched(prev => prev + 1);
      toast.success("You earned 20 credits!");
    } catch (error) {
      console.error("Error showing rewarded ad:", error);
      toast.error("Failed to show ad");
    } finally {
      setIsLoadingReward(false);
    }
  };

  // This would connect to Google Play Billing in a real Capacitor app
  const handlePurchaseCredits = (amount: number, price: string) => {
    toast.info(`This would open Google Play billing for ${price}`);
    console.log(`Purchase ${amount} credits for ${price}`);
    // In a real app, you would connect to Google Play Billing API here
  };

  if (!userData) {
    return null; // Loading state or redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <div className="container px-4 py-4">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/20 p-4 rounded-full mb-2">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Your Credits</h1>
          <div className="text-4xl font-bold my-2">{userData.credits}</div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Credits are used to download videos. Each video download costs 20 credits.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5 text-primary" /> 
                Free Credits
              </CardTitle>
              <CardDescription>
                Watch video ads to earn free credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-semibold">20</div>
                <div className="text-sm text-muted-foreground">credits per ad</div>
              </div>
              <div className="text-xs text-muted-foreground mb-4 text-center">
                {rewardedAdsWatched}/{maxDailyRewardedAds} ads watched today
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={watchRewardedAd} 
                disabled={isLoadingReward || rewardedAdsWatched >= maxDailyRewardedAds}
              >
                {isLoadingReward ? "Loading Ad..." : "Watch Ad for Credits"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Purchase Credits
              </CardTitle>
              <CardDescription>
                Buy credit packages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handlePurchaseCredits(100, "$0.99")}
              >
                <span>100 Credits</span>
                <span className="flex items-center">$0.99 <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handlePurchaseCredits(500, "$3.99")}
              >
                <span>500 Credits</span>
                <span className="flex items-center">$3.99 <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handlePurchaseCredits(1000, "$6.99")}
              >
                <span>1000 Credits</span>
                <span className="flex items-center">$6.99 <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavBar />
    </div>
  );
};

export default Credits;
