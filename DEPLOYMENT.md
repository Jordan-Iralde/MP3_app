# Deployment Guide — Resonix v0.1

## Backend Deployment

### Local Development
```bash
cd MPX/backend
npm install
npm run dev
```
✅ Runs on `http://localhost:3000`

### Building for Production
```bash
npm run build
# Creates: dist/server.js and dist/*.js files
```

### Running Production Build
```bash
npm start
# Runs compiled server from dist/
```

### Environment Configuration
Create `.env` in `MPX/backend/`:
```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-app-domain.com
```

### Docker Deployment

**Dockerfile** (create in `MPX/backend/`):
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY src ./src
COPY tsconfig.json ./
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t resonix-backend:v0.1 .
docker run -p 3000:3000 -e NODE_ENV=production resonix-backend:v0.1
```

### Cloud Hosting Options

#### Heroku
```bash
# Install Heroku CLI, then:
heroku create resonix-v01
heroku config:set NODE_ENV=production
git push heroku main
# Server at: https://resonix-v01.herokuapp.com
```

#### Railway
1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables in dashboard
4. Deploy automatically

#### DigitalOcean / Linode / AWS
1. Create Node.js server (Ubuntu 22.04 LTS recommended)
2. Clone repository
3. Install Node.js 18+
4. Run setup:
```bash
npm install
npm run build
pm2 start dist/server.js --name "resonix-api"
pm2 save
```

#### Vercel (Serverless)
Not recommended for v0.1+ (server is long-running)

---

## Mobile Deployment

### Build APK (Android)

#### Option 1: Expo Go (Development)
```bash
cd MPX/mobile
npm install
npm start
# Scan QR code with phone
```

#### Option 2: Development APK (Testing)
```bash
npm run android
# APK installs and runs on connected device
```

#### Option 3: Production APK (Play Store Ready)

**Option A: Using Expo EAS (Recommended)**
```bash
npm install -g eas-cli
eas build --platform android
# Builds APK and stores in Expo cloud
# Download and sideload: adb install app.apk
```

**Option B: Local Build**
Requires Android Studio + NDK setup:
```bash
npm run android -- --release
# Creates: android/app/build/outputs/apk/release/app-release.apk
```

### Configuring for Release

**1. Update version in `app.json`:**
```json
{
  "expo": {
    "version": "0.1.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

**2. Update app name and slug:**
```json
{
  "name": "Resonix",
  "slug": "resonix"
}
```

**3. Configure app icon and splash screen:**
- Place icon.png in `assets/images/icon.png`
- Place splash.png in `assets/images/splash-icon.png`
- Update adaptive icon colors in `app.json`

**4. Build production APK:**
```bash
eas build --platform android --release
```

### Publishing to Play Store

**1. Create Google Play developer account ($25 one-time fee)**

**2. Generate signed APK:**
```bash
# Via EAS (recommended)
eas build --platform android --release

# Or manually:
eas credentials
# Follow prompts to upload signing credentials
```

**3. Create app entry in Play Console**
- App name: "Resonix"
- Category: Music & Audio
- Content rating form
- Privacy policy URL
- Screenshots & descriptions

**4. Upload APK to Play Console**
- Internal testing → Closed testing → Production
- Fill app details, screenshots, description
- Submit for review (typically 4-24 hours)

**5. Manage release**
- Monitor metrics in Play Console
- Update in future versions via Play Console

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=3000                              # Port to run on
NODE_ENV=production                    # development or production

# CORS
CORS_ORIGIN=https://your-domain.com  # Allow specific origin
```

### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "API_URL": "https://api.resonix.com"
    }
  }
}
```

Access in code:
```typescript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.API_URL;
```

---

## Monitoring & Health Checks

### Backend Health Endpoint
```bash
curl https://api.resonix.com/health
# Response: { "status": "ok" }
```

Set up monitoring:
- **Uptime Robot**: Monitor `/health` endpoint
- **New Relic**: Application performance monitoring
- **DataDog**: Log aggregation and monitoring

---

## Security Checklist

Before production:

**Backend**
- ✅ Set `NODE_ENV=production`
- ✅ Configure `CORS_ORIGIN` to specific domain
- ✅ Use HTTPS (SSL certificate required)
- ✅ Set secure headers (helmet.js for future)
- ✅ Enable rate limiting (for v0.2+)
- ✅ Monitor error logs
- ✅ Regular dependency updates

**Mobile**
- ✅ Remove debug information from release build
- ✅ Test on real devices before release
- ✅ Verify permissions are appropriate
- ✅ Check privacy policy compliance
- ✅ Enable app signing in Play Store

---

## Version Management

### Semantic Versioning
- **0.1.0**: Bootstrap (current)
- **0.2.0**: File scanning
- **0.3.0**: Audio playback
- **0.4.0**: Advanced player
- **0.5.0**: Performance & stability
- **1.0.0**: Release ready

### Release Process
1. Update version in `package.json` and `app.json`
2. Update changelog
3. Tag in git: `git tag v0.1.0`
4. Build production: `npm run build`
5. Test thoroughly
6. Deploy backend
7. Submit mobile APK to Play Store
8. Monitor metrics

---

## Rollback Procedures

### Backend
```bash
# Keep previous release:
git checkout v0.1.0
npm install
npm run build
npm start
```

### Mobile
- Keep APK files with version numbers
- Use Play Console to rollback to previous version (internal testing)
- Users on old version can continue using

---

## Performance Optimization (Post v0.1)

**Backend:**
- Add caching headers
- Implement request compression
- Database indexing (when added)
- Load balancing

**Mobile:**
- Optimize bundle size
- Lazy load components
- Image compression
- Efficient list rendering

---

## Troubleshooting Deployment

### Backend won't start
```bash
# Check Node version
node --version  # Should be 18+

# Check port is available
netstat -an | grep 3000

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Mobile APK too large
- Remove unnecessary dependencies
- Use ProGuard minification
- Test file size: `ls -lh android/app/build/outputs/apk/release/`

### CORS errors from mobile
- Check backend `CORS_ORIGIN` matches mobile domain
- Verify backend is running and accessible
- Test with: `curl -H "Origin: https://your-mobile-domain.com" https://api.resonix.com/health`

---

## Cost Estimates

### Free/Low-Cost Options
- **Backend**: Heroku free tier (limited), DigitalOcean ($5/month)
- **Mobile**: Play Store ($25 one-time), Expo free tier
- **Database**: MongoDB Atlas free tier (for future)

### Recommended Setup (v0.1)
- DigitalOcean: $5-10/month
- Play Store: $25 one-time
- Expo Cloud (optional): Free tier
- **Total**: ~$30-50 first month, ~$5-10/month ongoing

---

## Support Resources

- **Expo Docs**: https://docs.expo.dev/
- **Express Docs**: https://expressjs.com/
- **Play Store Help**: https://support.google.com/googleplay/
- **DigitalOcean Docs**: https://docs.digitalocean.com/

---

**Last Updated**: January 28, 2026  
**Status**: v0.1 Ready for Deployment  
**Next Review**: Before v0.2 release

