# Frontend Deployment Guide - Vercel

This guide provides detailed step-by-step instructions for deploying the Cognium frontend to Vercel.

## Prerequisites

- Your frontend repository is pushed to GitHub
- Your backend is already deployed and accessible at `http://165.232.190.9:8000`
- You have a GitHub account
- You have a Vercel account (or can create one for free)

## Important Notes

- The backend API is located at: `http://165.232.190.9:8000`
- Main endpoints:
  - `GET /api/recommendations` - Fetches all recommendations/news
  - `POST /api/regenerate-recommendations` - Regenerates recommendations/news data
- The backend must have CORS configured to allow requests from your Vercel domain
- Since the backend uses HTTP (not HTTPS), ensure CORS is properly configured on the backend
- The regenerate endpoint requires POST method, so CORS must allow POST requests

## Step 1: Prepare Your Repository

### 1.1 Commit and Push Changes

Make sure all your changes are committed and pushed to GitHub:

```bash
cd cognium-frontend
git add .
git commit -m "Configure API for production deployment"
git push origin main
```

### 1.2 Note Your Backend URL

The backend API URL is:
- `http://165.232.190.9:8000`
- Main endpoint: `http://165.232.190.9:8000/api/recommendations`

## Step 2: Create a Vercel Account

### 2.1 Sign Up

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** in the top right
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

### 2.2 Verify Your Account

- Check your email if verification is required

## Step 3: Deploy to Vercel

### 3.1 Create New Project

1. After logging in, you'll see the Vercel dashboard
2. Click **Add New...** button (top right)
3. Select **Project**
4. You'll see a list of your GitHub repositories

### 3.2 Import Your Repository

1. Find your `cognium-frontend` repository in the list
2. Click **Import** next to it

### 3.3 Configure Project Settings

Before clicking **Deploy**, configure the following:

**Project Name:**
- Can be left as default (cognium-frontend) or changed to your preference
- This will create a URL like: `https://your-project-name.vercel.app`

**Framework Preset:**
- Should auto-detect: **Next.js**
- If not, select **Next.js**

**Root Directory:**
- Leave as `.` (it's already in the correct directory)

**Build and Output Settings:**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 3.4 Add Environment Variables

**CRITICAL STEP:** Add your backend URL here!

1. Click **Environment Variables** section
2. Click **Add** or the plus icon
3. Add this variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `http://165.232.190.9:8000`
     - This is the base URL of the containerized backend
   - **Environment:** Select all three (Production, Preview, Development)
4. Click **Save**

**Example:**
```
NEXT_PUBLIC_API_URL=http://165.232.190.9:8000
```

**Note:** The frontend will automatically append `/api/recommendations` to this URL when making API calls.

### 3.5 Deploy

1. Click the **Deploy** button at the bottom
2. Wait for the deployment to complete (usually 1-3 minutes)
3. You'll see build logs in real-time

## Step 4: Verify Deployment

### 4.1 Access Your Deployed App

1. After deployment completes, you'll see a success message
2. Click **Visit** or the URL shown (e.g., `https://cognium-frontend.vercel.app`)
3. Your app should load!

### 4.2 Test the Application

1. Check that the homepage loads
2. Navigate to the impact analysis page
3. Verify that news data is loading from your backend
4. Test the "Regenerate News" button (bottom left of dashboard):
   - Click the button to trigger regeneration
   - Wait for the process to complete
   - Verify that news content refreshes after regeneration
5. Check the browser console for any errors

## Step 5: Configure Backend CORS

### 5.1 Update Backend CORS Settings

**CRITICAL:** Since your frontend will be deployed on Vercel (HTTPS) and your backend is on HTTP at `http://165.232.190.9:8000`, you need to ensure the backend has CORS properly configured.

The backend engineer needs to configure CORS to allow requests from your Vercel domain:

1. **Backend CORS Configuration Required:**
   - The backend must allow requests from: `https://your-frontend.vercel.app`
   - Example: `https://cognium-frontend.vercel.app`
   - CORS headers should include:
     - `Access-Control-Allow-Origin: https://your-frontend.vercel.app`
     - `Access-Control-Allow-Methods: GET, POST, OPTIONS` (POST is required for regenerate endpoint)
     - `Access-Control-Allow-Headers: Content-Type`
   - **Important:** The regenerate endpoint (`/api/regenerate-recommendations`) uses POST method, so CORS must explicitly allow POST requests

2. **For Local Development:**
   - If you want to allow both local development and production, configure CORS to allow:
     - `http://localhost:3000` (local development)
     - `https://your-frontend.vercel.app` (production)

3. **Contact the Backend Engineer:**
   - Provide them with your Vercel deployment URL after deployment
   - Ask them to update the CORS configuration to include your Vercel domain
   - The backend should allow requests from your specific Vercel URL

**Important:** Since the backend uses HTTP and Vercel uses HTTPS, ensure the backend CORS configuration allows cross-origin requests from HTTPS domains.

## Step 6: Test Production Integration

### 6.1 Verify Data Loading

1. Open your deployed frontend URL
2. Check that news data loads correctly
3. Navigate through different pages
4. Check browser console (F12) for errors

### 6.2 Common Issues and Solutions

**Issue: "Failed to fetch" errors**
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel (`http://165.232.190.9:8000`)
- Verify backend CORS settings allow your Vercel domain
- Check that backend is accessible at `http://165.232.190.9:8000/api/recommendations`
- Test the backend URL directly in a browser or with curl
- Check browser console for CORS errors
- **For regenerate button:** Ensure CORS allows POST requests (not just GET)

**Issue: "Regenerate News" button not working**
- Verify the backend endpoint `http://165.232.190.9:8000/api/regenerate-recommendations` is accessible
- Check that CORS allows POST method for this endpoint
- Test the endpoint directly with curl: `curl -X POST http://165.232.190.9:8000/api/regenerate-recommendations`
- Check browser console for specific error messages
- Verify the backend is responding with proper CORS headers for POST requests

**Issue: Data not displaying**
- Open browser DevTools (F12) → Network tab
- Check if API calls are being made
- Verify the response format matches what your code expects

**Issue: 404 errors**
- Ensure your backend routes are accessible
- Test backend URL directly: `http://165.232.190.9:8000/api/recommendations`
- Verify the response format matches expected structure: `{ status: "success", data: [...] }`

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click **Settings** tab
3. Click **Domains**
4. Enter your custom domain (e.g., `cognium.com`)
5. Follow the DNS configuration instructions

### 7.2 Update Backend CORS

Don't forget to ask the backend engineer to add your custom domain to the CORS allowed origins!

## Step 8: Automatic Deployments

### 8.1 How It Works

- Vercel automatically deploys every time you push to your `main` branch
- Each deployment creates a preview URL
- Production deployments happen automatically

### 8.2 Testing Before Production

- Create a feature branch
- Push to GitHub
- Vercel creates a preview deployment
- Test the preview URL
- Merge to main when ready

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Look for TypeScript errors
3. Verify all dependencies are in `package.json`
4. Check for missing environment variables

### API Not Working in Production

1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Check CORS settings in your backend
3. Test backend URL directly in browser
4. Check browser console for specific error messages

### Need to Redeploy

1. Go to Vercel dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click the three dots on the latest deployment
5. Click **Redeploy**

## Next Steps

- Set up monitoring and analytics
- Configure preview deployments for pull requests
- Add performance monitoring
- Set up error tracking (e.g., Sentry)

## Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Next.js deployment guide: https://nextjs.org/docs/deployment
3. Check Vercel logs in the dashboard
4. Check backend accessibility at `http://165.232.190.9:8000/api/recommendations`
5. Verify backend CORS configuration with backend engineer

---

**Your app is now live! 🎉**

