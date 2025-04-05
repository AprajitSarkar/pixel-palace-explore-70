
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import MobileNavBar from '@/components/MobileNavBar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Gift, CreditCard, ArrowRight, ShoppingCart, Award, Video } from 'lucide-react';
import { showRewardedAd } from '@/services/adService';

const Shop = () => {
  const { currentUser, userData, updateUserCredits } = useAuth();
  const [isLoadingReward, setIsLoadingReward] = useState(false);
  const [rewardedAdsWatched, setRewardedAdsWatched] = useState(0);
  const navigate = useNavigate();

  // For a real app, you would track this in Firestore
  const maxDailyRewardedAds = 5;

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
      await showRewardedAd();
      
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

  const handleDailyCheckIn = async () => {
    try {
      await updateUserCredits(10);
      toast.success("Daily check-in successful! You earned 10 credits.");
      
      // In a real app, you would track this in Firestore so users can only check in once per day
    } catch (error) {
      toast.error("Failed to process daily check-in");
    }
  };

  // Premium subscription tiers
  const premiumTiers = [
    {
      name: "Monthly Premium",
      price: "$4.99/month",
      benefits: ["No ads", "Unlimited downloads", "500 credits monthly", "Priority support"]
    },
    {
      name: "Annual Premium",
      price: "$49.99/year",
      discount: "Save 17%",
      benefits: ["No ads", "Unlimited downloads", "1000 credits monthly", "Priority support", "Early access to new features"]
    }
  ];

  if (!userData) {
    return null; // Loading state or redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <div className="container px-4 py-4 pb-20">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/20 p-4 rounded-full mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Shop</h1>
          <div className="text-4xl font-bold my-2">
            {userData.credits} <span className="text-primary">credits</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Credits are used to download videos. Each video download costs 20 credits.
          </p>
        </div>
        
        {/* Daily Rewards */}
        <h2 className="text-xl font-semibold mb-3">Free Credits</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5 text-primary" /> 
                Free Ad Credits
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
                <Award className="mr-2 h-5 w-5 text-primary" />
                Daily Check-in
              </CardTitle>
              <CardDescription>
                Check in daily for free credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-semibold">10</div>
                <div className="text-sm text-muted-foreground">credits per day</div>
              </div>
              <div className="flex justify-center space-x-1 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs 
                      ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleDailyCheckIn}>
                Daily Check-in
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Credit Packages */}
        <h2 className="text-xl font-semibold mb-3">Credit Packages</h2>
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Starter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">100</p>
              <p className="text-sm text-muted-foreground">credits</p>
              <p className="text-lg font-medium mt-4">$0.99</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handlePurchaseCredits(100, "$0.99")}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Plus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">500</p>
              <p className="text-sm text-muted-foreground">credits</p>
              <p className="text-lg font-medium mt-4">$3.99</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handlePurchaseCredits(500, "$3.99")}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium">
              Best Value
            </div>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">1000</p>
              <p className="text-sm text-muted-foreground">credits</p>
              <p className="text-lg font-medium mt-4">$6.99</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePurchaseCredits(1000, "$6.99")}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Premium Subscription */}
        <h2 className="text-xl font-semibold mb-3">Premium Membership</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {premiumTiers.map((tier, index) => (
            <Card key={index} className={`relative overflow-hidden ${index === 1 ? 'border-primary/50' : ''}`}>
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium">
                  {tier.discount}
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center">
                      <Video className="h-4 w-4 mr-2 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Subscribe</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
      </div>
      <MobileNavBar />
    </div>
  );
};

export default Shop;
