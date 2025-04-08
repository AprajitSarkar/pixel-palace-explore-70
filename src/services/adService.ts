
import { supabase } from '@/lib/supabase';

// AdMob configuration
const APP_ID = 'ca-app-pub-3279473081670891~1431437217';
const BANNER_ID = 'ca-app-pub-3279473081670891/3394994104';
const INTERSTITIAL_ID = 'ca-app-pub-3279473081670891/5078157857';
const REWARDED_ID = 'ca-app-pub-3279473081670891/7308583729';

// We'll use these plugins directly when available in the runtime environment
// For now, we'll provide mock implementations that will be replaced with actual plugin usage

// Initialize AdMob with your configuration
export const initializeAds = async (): Promise<void> => {
  console.log('Initializing AdMob with APP_ID:', APP_ID);
  
  try {
    // When running on a device with plugins installed:
    if (window.Capacitor && window.Capacitor.Plugins.AdMob) {
      await window.Capacitor.Plugins.AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: [],
        initializeForTesting: true,
      });
      console.log('AdMob initialized successfully');
    } else {
      console.log('AdMob plugin not available, using mock implementation');
    }
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
};

// Show a banner ad
export const showAdBanner = async (): Promise<void> => {
  console.log('Attempting to show banner ad with ID:', BANNER_ID);
  
  try {
    // When running on a device with plugins installed:
    if (window.Capacitor && window.Capacitor.Plugins.AdMob) {
      await window.Capacitor.Plugins.AdMob.showBanner({
        adId: BANNER_ID,
        position: 'bottom',
        margin: 0,
      });
      console.log('Banner ad displayed successfully');
    } else {
      console.log('AdMob plugin not available, using mock implementation');
    }
  } catch (error) {
    console.error('Failed to show banner ad:', error);
  }
};

// Show an interstitial ad
export const showAdInterstitial = async (): Promise<void> => {
  console.log('Attempting to show interstitial ad with ID:', INTERSTITIAL_ID);
  
  try {
    // When running on a device with plugins installed:
    if (window.Capacitor && window.Capacitor.Plugins.AdMob) {
      await window.Capacitor.Plugins.AdMob.prepareInterstitial({
        adId: INTERSTITIAL_ID,
      });
      await window.Capacitor.Plugins.AdMob.showInterstitial();
      console.log('Interstitial ad displayed successfully');
    } else {
      console.log('AdMob plugin not available, using mock implementation');
    }
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
  }
};

// Show a rewarded ad and return a promise that resolves when the ad is completed
export const showRewardedAd = async (): Promise<boolean> => {
  console.log('Attempting to show rewarded ad with ID:', REWARDED_ID);
  
  try {
    // When running on a device with plugins installed:
    if (window.Capacitor && window.Capacitor.Plugins.AdMob) {
      await window.Capacitor.Plugins.AdMob.prepareRewardVideoAd({
        adId: REWARDED_ID,
      });
      
      const result = await window.Capacitor.Plugins.AdMob.showRewardVideoAd();
      
      if (result && result.type === 'RewardReceived') {
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
      console.log('AdMob plugin not available, using mock implementation');
      
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

// Initialize Google Play Billing
export const initializePlayStoreBilling = async (): Promise<boolean> => {
  console.log('Initializing Play Store billing');
  
  try {
    // When running on a device with plugins installed:
    if (window.Capacitor && window.Capacitor.Plugins.GooglePlayBilling) {
      await window.Capacitor.Plugins.GooglePlayBilling.initialize({
        enablePendingPurchases: true,
      });
      console.log('Play Store billing initialized successfully');
      return true;
    } else {
      console.log('GooglePlayBilling plugin not available, using mock implementation');
      return true; // Return true to indicate successful initialization (mock for development)
    }
  } catch (error) {
    console.error('Failed to initialize Play Store billing:', error);
    return false;
  }
};

// Purchase credits through Google Play Billing
export const purchaseCredits = async (productId: string, credits: number): Promise<boolean> => {
  console.log(`Purchase initiated for ${productId} (${credits} credits)`);
  
  try {
    // When running on a device with plugins installed:
    if (window.Capacitor && window.Capacitor.Plugins.GooglePlayBilling) {
      // Check if product is available
      const { products } = await window.Capacitor.Plugins.GooglePlayBilling.getProducts({
        productIds: [productId],
        productType: 'inapp',
      });
      
      if (products.length === 0) {
        console.error('Product not available:', productId);
        return false;
      }
      
      // Purchase the product
      const { purchase } = await window.Capacitor.Plugins.GooglePlayBilling.purchase({
        productId: productId,
        productType: 'inapp',
      });
      
      if (purchase && purchase.purchaseState === 'purchased') {
        // Record purchase in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('credit_purchases')
            .insert([{
              user_id: user.id,
              amount: purchase.price ? parseFloat(purchase.price) : 0,
              credits: credits,
              product_id: productId
            }]);
        }
        
        // Acknowledge the purchase
        await window.Capacitor.Plugins.GooglePlayBilling.acknowledgePurchase({
          purchaseToken: purchase.purchaseToken,
          productType: 'inapp',
        });
        
        return true;
      }
      
      return false;
    } else {
      console.log('GooglePlayBilling plugin not available, using mock implementation');
      
      // Record purchase in Supabase (mock for development)
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
    }
  } catch (error) {
    console.error('Purchase failed:', error);
    return false;
  }
};

// Add this to ensure TypeScript doesn't complain about Capacitor plugins
declare global {
  interface Window {
    Capacitor?: {
      Plugins: {
        AdMob?: any;
        GooglePlayBilling?: any;
      };
    };
  }
}
