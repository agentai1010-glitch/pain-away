# Public Frontend Deployment Guide (Vercel)

This document outlines the procedure for deploying the **Pain Away Public Frontend** to Vercel. 

**IMPORTANT**: This deployment explicitly excludes all internal portals (Reception, Director) to ensure maximum security and minimum bundle size for the public-facing application.

## 1. Environment Configuration

You must configure the following Environment Variables in your Vercel project settings:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | The absolute URL of your production backend API (e.g., `https://api.painawayclinic.com`). Do not include a trailing slash. |
| `VITE_DEPLOY_TARGET` | Yes | Must be strictly set to `public`. This triggers the build system to drop all internal admin routes from the production bundle via tree shaking. |

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

- [ ] **Landing Page**: Navigate to `/` and verify the hero section, services, and treatment backgrounds render correctly.
- [ ] **Booking Flow**: Click "Book Appointment", navigate through the form at `/book`, and verify functionality.
- [ ] **Security (No Admin Access)**: Attempt to visit `/reception` or `/director`. You should be gracefully redirected to the public Landing Page (`/`).
- [ ] **Network Verification**: Open browser dev tools and verify all API calls are correctly pointed at your `VITE_API_BASE_URL` and not `localhost`.
- [ ] **Performance**: Verify images are loading and Lighthouse scores are healthy (Vite handles minification automatically).

## 4. Local Verification

To test the production build locally before pushing to Vercel:

```bash
cd frontend
# Set target to public and build
VITE_DEPLOY_TARGET=public npm run build
# Preview the production build
npm run preview
```
