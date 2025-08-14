# 🚀 Production Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **Environment Setup**
- [ ] MongoDB Atlas cluster configured
- [ ] Environment variables set up
- [ ] JWT secret configured
- [ ] Production database connection tested

### ✅ **Security Configuration**
- [ ] Strong JWT secret generated
- [ ] CORS settings configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled

### ✅ **Performance Optimization**
- [ ] Database indexes optimized
- [ ] GraphQL query complexity limits set
- [ ] Caching strategy implemented
- [ ] Image optimization configured

## 🔧 **Environment Variables**

Create a `.env.production` file:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/novel-db?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: File upload (AWS S3, Cloudinary, etc.)
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🏗️ **Deployment Options**

### 1. **Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "functions": {
    "app/api/graphql/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret",
    "JWT_EXPIRES_IN": "7d",
    "NODE_ENV": "production"
  }
}
```

### 2. **Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 3. **Heroku**

```bash
# Install Heroku CLI
npm install -g heroku

# Create app and deploy
heroku create your-novel-app
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

### 4. **Docker Deployment**

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

## 🔒 **Security Hardening**

### 1. **Rate Limiting**

Install and configure rate limiting:

```bash
npm install express-rate-limit
```

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Apply to GraphQL endpoint
app.use('/api/graphql', limiter);
```

### 2. **CORS Configuration**

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3. **Input Validation**

```typescript
import { validate } from 'class-validator';

// Add validation to resolvers
const validateInput = async (input: any, schema: any) => {
  const errors = await validate(schema);
  if (errors.length > 0) {
    throw new ValidationError('Invalid input data');
  }
};
```

## 📊 **Monitoring & Logging**

### 1. **Application Monitoring**

```bash
npm install winston @sentry/node
```

**Logger Configuration:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. **Performance Monitoring**

```bash
npm install @apollo/server-plugin-landing-page-graphql-playground
```

**Apollo Server Configuration:**
```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
    ApolloServerPluginUsageReporting({
      sendReportsImmediately: true,
    }),
  ],
  introspection: process.env.NODE_ENV !== 'production',
});
```

## 🔄 **Database Migration**

### 1. **MongoDB Migration Script**

```typescript
// scripts/migrate.ts
import { connectToDatabase } from '../lib/database';
import { User, Novel, Chapter } from '../models';

async function migrate() {
  await connectToDatabase();
  
  // Add new fields to existing documents
  await User.updateMany(
    { preferences: { $exists: false } },
    { $set: { preferences: {} } }
  );
  
  // Create indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await Novel.collection.createIndex({ slug: 1 }, { unique: true });
  
  console.log('Migration completed');
  process.exit(0);
}

migrate().catch(console.error);
```

### 2. **Data Backup Strategy**

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="./backups/backup_$DATE"
tar -czf "./backups/backup_$DATE.tar.gz" "./backups/backup_$DATE"
rm -rf "./backups/backup_$DATE"
```

## 🚀 **Performance Optimization**

### 1. **Database Optimization**

```typescript
// Add compound indexes for common queries
novelSchema.index({ category: 1, status: 1, publishedAt: -1 });
novelSchema.index({ author: 1, status: 1 });
chapterSchema.index({ novel: 1, chapterNumber: 1 });
```

### 2. **GraphQL Query Optimization**

```typescript
// Implement DataLoader for N+1 query prevention
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await User.find({ _id: { $in: userIds } });
  return userIds.map(id => users.find(user => user._id.toString() === id));
});
```

### 3. **Caching Strategy**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache popular queries
const cacheQuery = async (key: string, query: () => Promise<any>) => {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const result = await query();
  await redis.setex(key, 3600, JSON.stringify(result)); // 1 hour cache
  return result;
};
```

## 📈 **Health Checks**

### 1. **Health Check Endpoint**

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';

export async function GET() {
  try {
    await connectToDatabase();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

### 2. **GraphQL Health Check**

```graphql
query HealthCheck {
  __schema {
    types {
      name
    }
  }
}
```

## 🔧 **Troubleshooting**

### Common Issues:

1. **MongoDB Connection Issues**
   - Check network connectivity
   - Verify connection string
   - Ensure IP whitelist includes deployment IP

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper token format

3. **Performance Issues**
   - Monitor database query performance
   - Check for N+1 query problems
   - Implement proper indexing

4. **Memory Leaks**
   - Monitor memory usage
   - Check for unclosed database connections
   - Implement proper cleanup

## 📞 **Support & Maintenance**

### Monitoring Tools:
- **Application**: Sentry, LogRocket
- **Database**: MongoDB Atlas Monitoring
- **Infrastructure**: Vercel Analytics, Railway Metrics

### Backup Schedule:
- **Daily**: Automated database backups
- **Weekly**: Full system backup
- **Monthly**: Security audit and updates

### Update Schedule:
- **Security**: Immediate updates
- **Features**: Monthly releases
- **Dependencies**: Weekly updates

---

## 🎉 **Deployment Complete!**

Your novel website backend is now production-ready with:
- ✅ Secure authentication
- ✅ Optimized performance
- ✅ Comprehensive monitoring
- ✅ Automated backups
- ✅ Health checks
- ✅ Error handling

The API is ready to serve your frontend application! 🚀
