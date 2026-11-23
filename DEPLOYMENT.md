# Deployment

The React/Vite frontend is published to GitHub Pages. Firebase Authentication,
Firestore, and Storage remain client-side Firebase services; the Gemini-backed
Supervisor API runs in Firebase Cloud Functions.

## One-time setup

1. In the GitHub repository settings, set Pages' build and deployment source to
   **GitHub Actions**. The existing `public/CNAME` publishes
   `www.luminoushand.com`.
2. At the DNS provider, point the `www` CNAME record to `bmn2179.github.io`.
   Add `www.luminoushand.com` as the Pages custom domain and enable HTTPS once
   DNS has propagated.
3. Add `www.luminoushand.com` (and `luminoushand.com` if it is used) to the
   Firebase Authentication authorized domains.
4. Configure the Gemini key as a Firebase Functions secret:

   ```sh
   firebase functions:secrets:set GEMINI_API_KEY --project luminous-hand
   ```

5. To deploy Functions automatically from GitHub Actions, add the repository
   Actions secret `FIREBASE_SERVICE_ACCOUNT`. Its service account must be able
   to deploy Cloud Functions, build and deploy their container, manage the
   `GEMINI_API_KEY` secret, and act as the Functions runtime service account.
   The Firebase Functions deployment workflow runs when its source or config
   changes on `main`.

The Functions deployer also needs the Firebase project configured for Cloud
Functions (including billing and the required Google Cloud APIs). To deploy
manually after setting the secret:

```sh
npx --yes firebase-tools deploy --only functions --project luminous-hand
```

## App deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static
site from the Bun lockfile and publishes `dist` to GitHub Pages. The frontend
uses the `us-central1` `supervisorApi` function URL by default. To override it,
set the GitHub Actions repository variable `VITE_API_BASE_URL` to the function
URL, for example:

```text
https://us-central1-luminous-hand.cloudfunctions.net/supervisorApi
```

The AI endpoints require a signed-in Firebase user. Their CORS allowlist
contains the production domains and local Vite development/preview origins.
