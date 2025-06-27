# Deploy to Base

## Prerequisites
- Base account (sign up at https://base.org)
- GitHub repository with your project

## Step-by-Step Deployment

### 1. Push to GitHub
Make sure your project is pushed to a GitHub repository:
```bash
git add .
git commit -m "Prepare for Base deployment"
git push origin main
```

### 2. Connect to Base
1. Go to [Base.org](https://base.org) and sign in
2. Navigate to the deployment section
3. Connect your GitHub repository
4. Choose the branch (usually `main`)

### 3. Configure Build Settings
Base will auto-detect your Vite project, but verify these settings:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18

### 4. Environment Variables
Add these environment variables in Base dashboard:
- `VITE_SUPABASE_URL`: `https://oqeypiandvukrzsxjntr.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 5. Deploy
Click "Deploy" and wait for the build to complete.

### 6. Custom Domain (Optional)
- Go to your site settings in Base
- Add your custom domain
- Update DNS records as instructed

## Files Created for Deployment
- `DEPLOYMENT.md`: This guide

## Troubleshooting
- If build fails, check the build logs in Base dashboard
- Ensure all environment variables are set correctly
- Verify Node.js version compatibility
- Make sure your project is compatible with Base's deployment platform 