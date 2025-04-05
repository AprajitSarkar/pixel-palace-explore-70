
# Firebase Security Rules

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own likes
    match /likes/{likeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read and write their own history
    match /history/{historyId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // By default, deny all read/write operations
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to read and write their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow access to public files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // By default, deny all read/write operations
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules:

1. **For Firestore Rules**:
   - Go to Firebase Console > Firestore Database > Rules
   - Paste the Firestore rules
   - Click "Publish"

2. **For Storage Rules**:
   - Go to Firebase Console > Storage > Rules
   - Paste the Storage rules
   - Click "Publish"

These rules implement the principle of least privilege, ensuring users can only access their own data. The rules:

- Allow users to read and write their own user document
- Allow users to manage their likes and history
- Allow users to manage their own files in storage
- Allow public read access to files in the 'public' folder
- Deny all other read and write operations by default
