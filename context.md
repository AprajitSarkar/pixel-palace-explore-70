
# Pixel Palace Explorer - Project Documentation

## Overview
Pixel Palace Explorer is a mobile-focused application that allows users to browse, search, like, and download high-quality videos from Pixabay. The app includes features like user authentication, credit system, in-app purchases, and ad integration.

## Technology Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Firebase (Authentication, Firestore, Realtime Database, Storage)
- **Mobile**: Capacitor for native mobile functionality
- **External APIs**: Pixabay API for video content
- **Monetization**: AdMob integration, In-App Purchases

## Pages & Features

### 1. Home Page
- Video grid display with thumbnail previews
- Category selection with popular categories
- Featured content
- Navigation to other sections of the app

### 2. Search Page
- Search bar for finding videos by keywords
- Filter videos by categories
- Display search results in a grid layout
- Load more functionality

### 3. Likes Page
- Grid display of videos the user has liked
- Requires authentication
- Option to remove videos from likes
- Download functionality for liked videos

### 4. Settings Page
- User profile management
- API key configuration (Pixabay)
- App theme settings
- Account deletion option
- Privacy policy and terms of service links

### 5. Login Page
- Email/password authentication
- Google sign-in option
- User registration
- Password reset functionality

### 6. Credits Page
- Display current credit balance
- Watch ads to earn free credits
- Purchase credit packages
- Credits usage tracking

### 7. Shop Page
- Credit packages for purchase
- Secure payment processing
- Free credit options (watch ads)
- Payment history

## Key Components

### ProfileMenu
Navigation menu showing user profile and options including:
- Home, Likes, Shop links
- Credits balance display
- Settings access
- Log out option

### Authentication System
Complete Firebase authentication with:
- User registration
- Login with email/password
- Social login with Google
- Session management
- Account deletion with data cleanup

### Credit System
- Credits for downloading videos (20 credits per download)
- New users receive 50 credits
- Credits can be earned by watching ads
- Credits can be purchased in packages

## API Integration

### Pixabay API
- **Base URL**: `https://pixabay.com/api/videos/`
- **API Key**: Default key provided (`49658971-12bf63930d640b2f9ffcc901c`), users can set their own
- **Functionality**:
  - Search videos by keywords
  - Filter by categories
  - Sort by popularity or latest
  - Video download options

### Parameters
- `q`: Search query
- `lang`: Language for results
- `id`: Specific video ID
- `video_type`: all/film/animation
- `category`: Filter by category
- `min_width`, `min_height`: Minimum dimensions
- `editors_choice`: Boolean for editor's choice content
- `safesearch`: Boolean for safe content
- `order`: 'popular' or 'latest'
- `page`, `per_page`: Pagination controls

## Monetization

### AdMob Integration
- **App ID**: `ca-app-pub-3279473081670891~1431437217`
- **Ad Units**:
  - Banner: `ca-app-pub-3279473081670891/3394994104`
  - Interstitial: `ca-app-pub-3279473081670891/5078157857`
  - Rewarded: `ca-app-pub-3279473081670891/7308583729`
- **Implementation**:
  - Interstitial ads shown every 5 videos viewed
  - Rewarded ads available for earning credits
  - Banner ads on appropriate screens

### In-App Purchases
- Credit packages at different price points:
  - Starter Pack: 100 credits - $2.99
  - Popular Pack: 500 credits - $9.99
  - Pro Pack: 1200 credits - $19.99
  - Ultimate Pack: 3000 credits - $39.99

## Firebase Database Structure

### Firestore Collections
- **users**: User profiles and metadata
  - Credits balance
  - Account information
  - Preferences
- **likes**: Videos liked by users
- **history**: Video viewing history

### Realtime Database Rules
```javascript
{
  "rules": {
    "users": {
      "$uid": {
        // Allow users to read and write their own data
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        
        "purchases": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        
        "history": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    },
    
    "public": {
      // Allow public read access, but only authenticated users can write
      ".read": true,
      ".write": "auth != null"
    },
    
    // By default, deny all read/write operations
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

## Capacitor Configuration

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3306f663ce8c417fa46b7ed22e1d99de',
  appName: 'pixel-palace-explore',
  webDir: 'dist',
  server: {
    url: 'https://3306f663-ce8c-417f-a46b-7ed22e1d99de.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false
    }
  }
};

export default config;
```

## Data Flow and Security

### Authentication Flow
1. User registers or signs in
2. Firebase authenticates and creates session
3. App fetches user data from Firestore
4. Profile menu and protected features become accessible

### Download Process
1. User browses and selects a video
2. App checks if user is authenticated
3. App verifies user has sufficient credits (20 per download)
4. Credits are deducted from user account
5. Video download initiates
6. Download record is stored in user history

### Security Measures
- Firebase Authentication for secure user management
- Realtime Database Rules to protect user data
- Content filtering via Pixabay's safesearch parameter
- Secure credit transactions tied to authenticated users

## Mobile-Specific Features (Capacitor)
- Offline capability for liked videos
- Native device notifications
- Deep linking
- App store payment integration
- Mobile-optimized UI with bottom navigation
- Splash screen and app icon

## Testing and Deployment
- Test ad functionality in development using test ad units
- Test in-app purchases using sandbox environment
- Deploy to app stores (Google Play, App Store) using Capacitor
- Configure app store listings and metadata

---

This documentation provides a comprehensive overview of the Pixel Palace Explorer application, its features, integrations, and technical specifications.
