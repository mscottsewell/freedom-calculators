# Deployment Instructions for GitHub Pages

## Prerequisites
- A GitHub account
- Git installed on your computer
- Your project files ready for deployment

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" button in the top right corner and select "New repository"
3. Name your repository (e.g., "financial-calculators")
4. Make sure it's set to "Public" (required for free GitHub Pages)
5. Don't initialize with README, .gitignore, or license (we'll push existing code)
6. Click "Create repository"

## Step 2: Configure for GitHub Pages Deployment

Your project is already configured with the gh-pages package! You just need to update the base URL.

### Update vite.config.ts for your repository

Open `vite.config.ts` and change the base URL:

```typescript
// Change this line:
base: './',

// To this (replace 'your-repo-name' with your actual repository name):
base: '/your-repo-name/',
```

For example, if your repository is named "financial-calculators":
```typescript
base: '/financial-calculators/',
```

## Step 3: Initialize Git and Push to GitHub

Open terminal/command prompt in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Financial calculators app"

# Add your GitHub repository as origin
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace the URL with your actual repository URL from GitHub.

## Step 4: Deploy to GitHub Pages

```bash
# Build and deploy
npm run deploy
```

This command will:
1. Build your project (`npm run build`)
2. Create a `gh-pages` branch
3. Push the built files to that branch

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch and "/ (root)" folder
6. Click "Save"

## Step 6: Access Your Deployed App

After a few minutes, your app will be available at:
`https://yourusername.github.io/your-repo-name`

GitHub will show you the URL in the Pages settings.

## Future Updates

To update your deployed app:

```bash
# Make your changes
# Commit changes
git add .
git commit -m "Description of changes"
git push

# Deploy updates
npm run deploy
```

## Troubleshooting

### Common Issues:

1. **404 Error**: Check that the `base` in `vite.config.js` matches your repository name
2. **Blank Page**: Ensure all asset paths are correct and the base URL is properly configured
3. **Build Errors**: Run `npm run build` locally first to catch any issues

### Checking Build Locally:
```bash
npm run build
npm run preview
```

This lets you test the production build locally before deploying.

## Important Notes

- GitHub Pages can take a few minutes to update after deployment
- Make sure your repository is public for free GitHub Pages
- The `gh-pages` branch is automatically created and managed
- Your source code stays on the `main` branch, built files go to `gh-pages`

## Repository Structure After Deployment

```
your-repo/
├── main branch (source code)
└── gh-pages branch (built files for hosting)
```

Your app will be live and accessible to anyone with the URL!