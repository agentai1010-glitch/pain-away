# Clinic Portal Deployment Guide (Vercel)

This document outlines the procedure for deploying the **Pain Away Internal Clinic Portal** to Vercel. 

**IMPORTANT**: This deployment explicitly excludes all public website assets (landing page, public booking flow) to ensure the portal remains lightweight and completely separated from the public internet logic.

## 1. Environment Configuration

You must configure the following Environment Variables in your Vercel project settings:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | The absolute URL of your production backend API (e.g., `https://api.painawayclinic.com`). Do not include a trailing slash. |
| `VITE_DEPLOY_TARGET` | Yes | Must be strictly set to `internal`. This triggers the build system to generate the Clinic Portal and strip out the public website. |

## 2. Vercel Project Setup

1. Connect your GitHub repository to Vercel.
2. Set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `frontend`.
4. Leave the **Build Command** and **Output Directory** as their defaults:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the Environment Variables listed above.
6. Click **Deploy**.

## 3. Post-Deployment Verification Checklist

After deployment completes, perform the following verifications on the live production URL:

- [ ] **Portal Selection**: Navigate to `/` and verify you see the Internal Operations System portal selector (Reception and Director options).
- [ ] **Authentication**: Click on "Reception Login" and verify it navigates to `/reception`. Attempt to bypass login by directly navigating to `/reception/dashboard` and ensure you are redirected back to the login page.
- [ ] **Director Portal**: Verify the "Director Login" leads to `/director` and secures `/director/dashboard`.
- [ ] **Public Exclusion**: Attempt to visit `/book` or `/catalog`. You should be gracefully redirected to the internal Portal Landing Page (`/`).
- [ ] **Network Verification**: Open browser dev tools and verify all API calls point at your `VITE_API_BASE_URL` and not `localhost`.

## 4. Local Verification

To test the internal production build locally before pushing to Vercel:

```bash
cd frontend
# Set target to internal and build
VITE_DEPLOY_TARGET=internal npm run build
# Preview the production build
npm run preview
```
