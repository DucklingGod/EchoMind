# Deploy EchoMind to Vercel

## Prerequisites

1. A Vercel account (https://vercel.com)
2. GitHub/GitLab/Bitbucket account with your code pushed
3. Required environment variables:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `SESSION_SECRET` - A random secure string (generate with: `openssl rand -base64 32`)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the configuration

3. **Add Environment Variables**
   - In the "Environment Variables" section, add:
     - `DATABASE_URL` = Your Neon database connection string
     - `OPENAI_API_KEY` = Your OpenAI API key
     - `SESSION_SECRET` = Generate with `openssl rand -base64 32`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add OPENAI_API_KEY
   vercel env add SESSION_SECRET
   ```

4. **Deploy**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

## Post-Deployment

1. **Verify the deployment**
   - Visit your Vercel URL
   - Test creating a reflection
   - Check that AI responses work
   - Test voice transcription (if using)

2. **Set up Custom Domain (Optional)**
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain

## Troubleshooting

### Database Connection Issues
- Ensure your `DATABASE_URL` includes `?sslmode=require`
- Neon databases are serverless-compatible and work great with Vercel

### API Timeout Errors
- Vercel free tier has 10s function timeout
- Upgrade to Pro for 60s timeout if needed
- OpenAI calls usually complete within 5s

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` (not just `devDependencies`)

### Cold Start Performance
- First request after inactivity may be slower (2-3s)
- Subsequent requests will be fast
- Consider upgrading to Vercel Pro for better performance

## Architecture Notes

### How It Works
- **Frontend**: Built with Vite and deployed as static files
- **Backend**: Express API converted to Vercel serverless functions
- **Database**: PostgreSQL via Neon (serverless-compatible)

### File Structure
```
├── api/
│   └── index.ts          # Serverless API entry point
├── client/               # React frontend source
├── dist/                 # Built frontend (auto-generated)
├── server/               # Backend source code
├── vercel.json           # Vercel configuration
└── .vercelignore         # Files to exclude from deployment
```

### Limitations
- Maximum function execution time: 10s (free) / 60s (pro)
- Maximum bundle size: 250MB
- Stateless functions (use database for persistence)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `SESSION_SECRET` | Session encryption key | Random 32+ character string |

## Support

For issues specific to:
- **Vercel deployment**: Check Vercel docs (https://vercel.com/docs)
- **Database**: Check Neon docs (https://neon.tech/docs)
- **OpenAI**: Check OpenAI docs (https://platform.openai.com/docs)
