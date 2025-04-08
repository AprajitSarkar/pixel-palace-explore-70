
import { supabase } from '@/lib/supabase';
import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

// AdMob configuration
const APP_ID = 'ca-app-pub-3279473081670891~1431437217';
const BANNER_ID = 'ca-app-pub-3279473081670891/3394994104';
const INTERSTITIAL_ID = 'ca-app-pub-3279473081670891/5078157857';
const REWARDED_ID = 'ca-app-pub-3279473081670891/7308583729';

// Initialize AdMob with your configuration
export const initializeAds = async (): Promise<void> => {
  console.log('Initializing AdMob with APP_ID:', APP_ID);
  
  try {
    if (window.Capacitor) {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: [],
        initializeForTesting: true,
      });
      console.log('AdMob initialized successfully');
    } else {
      console.log('Running in browser environment, using mock implementation');
    }
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
};

// Show a banner ad
export const showAdBanner = async (): Promise<void> => {
  console.log('Attempting to show banner ad with ID:', BANNER_ID);
  
  try {
    if (window.Capacitor) {
      const options: BannerAdOptions = {
        adId: BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      };
      await AdMob.showBanner(options);
      console.log('Banner ad displayed successfully');
    } else {
      console.log('Running in browser environment, using mock implementation');
    }
  } catch (error) {
    console.error('Failed to show banner ad:', error);
  }
};

// Show an interstitial ad
export const showAdInterstitial = async (): Promise<void> => {
  console.log('Attempting to show interstitial ad with ID:', INTERSTITIAL_ID);
  
  try {
    if (window.Capacitor) {
      await AdMob.prepareInterstitial({
        adId: INTERSTITIAL_ID,
      });
      await AdMob.showInterstitial();
      console.log('Interstitial ad displayed successfully');
    } else {
      console.log('Running in browser environment, using mock implementation');
    }
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
  }
};

// Show a rewarded ad and return a promise that resolves when the ad is completed
export const showRewardedAd = async (): Promise<boolean> => {
  console.log('Attempting to show rewarded ad with ID:', REWARDED_ID);
  
  try {
    if (window.Capacitor) {
      await AdMob.prepareRewardVideoAd({
        adId: REWARDED_ID,
      });
      
      const result = await AdMob.showRewardVideoAd();
      
      if (result && result.reward) {
        // Record ad view in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('ad_views')
            .insert([{
              user_id: user.id,
              credits: 10
            }]);
        }
        
        return true;
      }
      
      return false;
    } else {
      console.log('Running in browser environment, using mock implementation');
      
      // Mock implementation for development
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('ad_views')
            .insert([{
              user_id: user.id,
              credits: 10
            }]);
        }
      } catch (error) {
        console.error('Error recording ad view:', error);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error showing rewarded ad:', error);
    return false;
  }
};

// Initialize Google Play Billing - simple mock version since we're having issues installing the plugin
export const initializePlayStoreBilling = async (): Promise<boolean> => {
  console.log('Mock initializing Play Store billing');
  // Just return true for now until we can properly install the billing plugin
  return true;
};

// Purchase credits through Google Play Billing - simple mock version
export const purchaseCredits = async (productId: string, credits: number): Promise<boolean> => {
  console.log(`Mock purchase initiated for ${productId} (${credits} credits)`);
  
  try {
    // Mock implementation for development
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('credit_purchases')
          .insert([{
            user_id: user.id,
            amount: 0, // Would be real amount in production
            credits: credits,
            product_id: productId
          }]);
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Purchase failed:', error);
    return false;
  }
};

// Add this to ensure TypeScript doesn't complain about Capacitor plugins
declare global {
  interface Window {
    Capacitor?: any;
  }
}
