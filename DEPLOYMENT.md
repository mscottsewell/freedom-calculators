# Deploy Your Financial Planning Calculator Suite to GitHub Pages

This guide will help you deploy your Spark application to GitHub Pages so it can be accessed by students and others online.

## Prerequisites

1. Your code should be in a GitHub repository
2. Make sure all your changes are committed and pushed to the `main` branch

## Deployment Options

### Option 1: Automatic Deployment (Recommended)

The repository now includes a GitHub Actions workflow that will automatically deploy your app whenever you push changes to the main branch.

#### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to your GitHub repository
   - Click on "Settings" tab
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to the "Actions" tab in your GitHub repository
   - Watch the deployment workflow run
   - Once complete, your site will be available at: `https://yourusername.github.io/spark-template/`

### Option 2: Manual Deployment

If you prefer to deploy manually or need to troubleshoot:

1. **Install gh-pages** (already done):
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Build and deploy:**
   ```bash
   npm run deploy
   ```

## Configuration Details

The following files have been configured for GitHub Pages deployment:

### `.github/workflows/deploy.yml`
- Automated CI/CD pipeline
- Builds the app on every push to main
- Deploys to GitHub Pages automatically

### `vite.config.ts`
- Configured with proper base path for GitHub Pages
- Handles asset paths correctly in production

### `package.json`
- Added deploy script for manual deployment
- Includes gh-pages dependency

## Accessing Your Deployed App

Once deployed, your Financial Planning Calculator Suite will be available at:
```
https://[your-github-username].github.io/spark-template/
```

Replace `[your-github-username]` with your actual GitHub username.

## Troubleshooting

### Common Issues:

1. **404 Error**: Make sure GitHub Pages is enabled and set to "GitHub Actions" source
2. **Assets not loading**: Check that the base path in `vite.config.ts` matches your repository name
3. **Build fails**: Check the Actions tab for error logs

### Updating the Base Path:

If your repository name is different from "spark-template", update the base path in `vite.config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

## Making Updates

After initial deployment, any push to the main branch will automatically trigger a new deployment. Your changes will be live within a few minutes.

## Security Note

This deployment configuration is suitable for public educational tools. The app doesn't store sensitive data server-side, making it safe for GitHub Pages hosting.