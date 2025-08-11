# Quick Start Guide for GitHub Pages Deployment

## For Immediate Deployment:

1. **Create your GitHub repository** (follow Step 1 in DEPLOYMENT.md)

2. **Update the base URL** in `vite.config.ts`:
   ```typescript
   // Change this line:
   base: './',
   
   // To this (replace with your repo name):
   base: '/your-repo-name/',
   ```

3. **Run these commands** in your terminal:
   ```bash
   # Initialize git and connect to your repo
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   
   # Deploy to GitHub Pages
   npm run deploy
   ```

4. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Select "gh-pages" branch
   - Click Save

5. **Your app will be live at:**
   `https://yourusername.github.io/your-repo-name`

That's it! For detailed instructions, see DEPLOYMENT.md

## Making Updates Later:
```bash
git add .
git commit -m "Your update message"
git push
npm run deploy
```