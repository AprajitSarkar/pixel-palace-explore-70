
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import MobileNavBar from '@/components/MobileNavBar';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Gift, Video, CreditCard, Diamond } from 'lucide-react';

interface CreditPackage {
  id: string;
  title: string;
  credits: number;
  price: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const Shop = () => {
  const { userData, updateUserCredits } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      title: 'Starter Pack',
      credits: 100,
      price: '$2.99',
      icon: <Coins className="h-10 w-10 text-amber-500" />
    },
    {
      id: 'popular',
      title: 'Popular Pack',
      credits: 500,
      price: '$9.99',
      icon: <Gift className="h-10 w-10 text-indigo-500" />,
      popular: true
    },
    {
      id: 'pro',
      title: 'Pro Pack',
      credits: 1200,
      price: '$19.99',
      icon: <Video className="h-10 w-10 text-blue-500" />
    },
    {
      id: 'ultimate',
      title: 'Ultimate Pack',
      credits: 3000,
      price: '$39.99',
      icon: <Diamond className="h-10 w-10 text-purple-500" />
    }
  ];

  const handlePurchase = async (pack: CreditPackage) => {
    setIsLoading(pack.id);
    
    try {
      // Simulating a purchase process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user's credits
      await updateUserCredits(pack.credits);
      
      toast.success(`You've purchased ${pack.credits} credits!`);
      navigate('/credits');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to complete purchase. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRewardedAd = async () => {
    setIsLoading('ad');
    
    try {
      // Simulating a rewarded ad viewing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reward user with 10 credits
      await updateUserCredits(10);
      
      toast.success("You've earned 10 credits from watching an ad!");
    } catch (error) {
      console.error('Rewarded ad failed:', error);
      toast.error('Failed to reward credits. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      
      <main className="container px-4 py-6 max-w-5xl">
        <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Credit Shop</h1>
            <p className="text-muted-foreground">
              Purchase credits to download high-quality videos
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 glass-card px-4 py-2 rounded-full">
            <p className="text-sm font-medium">
              Your balance: <span className="text-primary font-bold">{userData?.credits || 0}</span> credits
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {creditPackages.map((pack) => (
            <Card 
              key={pack.id} 
              className={`relative overflow-hidden ${pack.popular ? 'border-primary shadow-md' : ''}`}
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
                  {(pack.credits / 50).toFixed(0)} video downloads
                </p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(pack)}
                  disabled={isLoading === pack.id}
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
                onClick={handleRewardedAd}
                disabled={isLoading === 'ad'}
              >
                {isLoading === 'ad' ? 'Loading Ad...' : 'Watch Ad for 10 Credits'}
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
                Secure Payments
              </CardTitle>
              <CardDescription>
                We accept various payment methods for your convenience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-wrap gap-4 justify-center">
              <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                Visa
              </div>
              <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                MC
              </div>
              <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                PayPal
              </div>
              <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                Stripe
              </div>
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground text-center px-6">
              All transactions are secure and encrypted. By purchasing credits, you agree to our Terms of Service and Privacy Policy.
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <MobileNavBar />
    </div>
  );
};

export default Shop;
