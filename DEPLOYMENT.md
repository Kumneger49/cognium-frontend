# Frontend Deployment Guide - Vercel

This guide provides detailed step-by-step instructions for deploying the Cognium frontend to Vercel.

## Prerequisites

- Your frontend repository is pushed to GitHub
- Your backend is already deployed on Render
- You have a GitHub account
- You have a Vercel account (or can create one for free)

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

Make sure you have your Render backend URL ready. It should look like:
- `https://your-backend-name.onrender.com`
- Example: `https://backend-dxg7.onrender.com`

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
   - **Value:** `https://your-backend-name.onrender.com`
     - Replace with your actual Render backend URL
   - **Environment:** Select all three (Production, Preview, Development)
4. Click **Save**

**Example:**
```
NEXT_PUBLIC_API_URL=https://backend-dxg7.onrender.com
```

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
4. Check the browser console for any errors

## Step 5: Configure Backend CORS

### 5.1 Update Backend CORS Settings

Now that your frontend is deployed, you need to tell your backend to allow requests from your Vercel domain.

1. Go back to your Render backend dashboard
2. Navigate to your backend service
3. Go to **Environment** tab
4. Update the `CORS_ALLOWED_ORIGINS` variable:
   - Current value might be `*` or localhost
   - Change to: `https://your-frontend.vercel.app`
   - Example: `https://cognium-frontend.vercel.app`
5. Click **Save Changes**
6. Wait for the backend to redeploy (automatic)

**Optional:** If you want to allow both local development and production:
```
http://localhost:3000,https://cognium-frontend.vercel.app
```

## Step 6: Test Production Integration

### 6.1 Verify Data Loading

1. Open your deployed frontend URL
2. Check that news data loads correctly
3. Navigate through different pages
4. Check browser console (F12) for errors

### 6.2 Common Issues and Solutions

**Issue: "Failed to fetch" errors**
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify backend CORS settings allow your Vercel domain
- Check that backend is running on Render

**Issue: Data not displaying**
- Open browser DevTools (F12) → Network tab
- Check if API calls are being made
- Verify the response format matches what your code expects

**Issue: 404 errors**
- Ensure your backend routes are accessible
- Test backend URLs directly (e.g., `https://backend.onrender.com/`)

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click **Settings** tab
3. Click **Domains**
4. Enter your custom domain (e.g., `cognium.com`)
5. Follow the DNS configuration instructions

### 7.2 Update Backend CORS

Don't forget to add your custom domain to `CORS_ALLOWED_ORIGINS` in Render!

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
4. Check your backend Render logs

---

**Your app is now live! 🎉**

