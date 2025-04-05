
# Firebase Realtime Database Rules

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

## How to Apply These Rules:

1. Go to Firebase Console > Realtime Database > Rules
2. Paste the rules above
3. Click "Publish"

These rules enforce security by:
- Allowing users to only read and write their own data
- Tracking user purchases in a secure location
- Permitting users to manage their own history
- Making specific public data available to all users
- Denying access to any other data by default
