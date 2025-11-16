# Deploying Firebase Rules

To fix the "Missing or insufficient permissions" errors, you need to deploy your Firestore and Storage rules to Firebase.

## What Was Fixed

The rules have been updated to include:
- ✅ Rules for the `passes` collection (was missing, causing "Pass failed" errors)
- ✅ Rules for the `likes` collection (already existed)
- ✅ Rules for the `dogs` collection (allows public reads)
- ✅ Rules for Storage uploads

## Steps to Deploy:

1. **Make sure you have Firebase CLI installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase (if not already logged in):**
   ```bash
   firebase login
   ```

3. **Deploy only the rules (without deploying hosting):**
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

   Or if you want to deploy everything:
   ```bash
   firebase deploy
   ```

4. **Verify the deployment:**
   - Go to Firebase Console: https://console.firebase.google.com/
   - Select your project: `senior-project-pawmatch`
   - Go to Firestore Database → Rules
   - Go to Storage → Rules
   - Verify the rules match what's in your local files

## Alternative: Deploy via Firebase Console

If you prefer using the web interface:

1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `firebase/firestore.rules` and paste it
5. Click **Publish**
6. Go to **Storage** → **Rules** tab
7. Copy the contents of `firebase/storage.rules` and paste it
8. Click **Publish**

After deploying, refresh your app and the permission errors should be resolved.

