# 📚 Novel Website Backend

A complete, production-ready backend for a novel reading website built with Next.js 15, MongoDB, and GraphQL.

## 🎯 **What This Is**

A full-featured backend system where users can:

- Register and login to their accounts
- Browse and read novels in English and Urdu
- Search for novels by author, category, or tags
- Upload profile pictures and novel covers
- Save favorite novels and bookmark chapters

## ✅ **Current Status: PRODUCTION READY**

Your backend is **100% complete** and ready for deployment!

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
npm install
```

### **2. Set Up Environment**

Create `.env.local`:

```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### **3. Seed Database**

```bash
npm run seed
```

### **4. Start Development Server**

```bash
npm run dev
```

### **5. Test Your API**

Visit: `http://localhost:3000/graphql`

## 📁 **Project Structure**

```
├── app/                    # Next.js app directory
│   └── api/graphql/       # GraphQL API endpoint
├── models/                # MongoDB models (10 models)
├── resolvers/             # GraphQL resolvers
├── graphql/               # GraphQL schema and types
├── lib/                   # Utility functions
├── scripts/               # Test and setup scripts
├── public/                # Static files and uploads
└── types/                 # TypeScript type definitions
```

## 📚 **Documentation**

- **`doc.txt`** - Main project documentation and current status
- **`PROJECT_OVERVIEW.md`** - Complete project overview
- **`DEPLOYMENT.md`** - Simple deployment guide
- **`TESTING_GUIDE.md`** - How to test your backend

## 🛠️ **Technology Stack**

- **Backend**: Next.js 15 with TypeScript
- **Database**: MongoDB with Mongoose
- **API**: GraphQL with Apollo Server
- **Authentication**: JWT tokens
- **File Processing**: Sharp image library
- **Languages**: English and Urdu support

## 🎉 **Features**

### ✅ **Working Perfectly**

- User registration and login
- Complete novel management system
- Author profiles and management
- Categories and tags
- File uploads (images)
- Search and filtering
- Multilingual content (English + Urdu)
- GraphQL API with 50+ operations

## 🚀 **Deploy to Production**

Your backend is ready for production! See `DEPLOYMENT.md` for simple deployment instructions.

### **Quick Deploy to Vercel**

```bash
npm i -g vercel
vercel --prod
```

## 📞 **Need Help?**

- Check the documentation files
- Run `npm run test` to test your backend
- Visit `http://localhost:3000/graphql` to explore the API

---

**Your novel website backend is complete and ready for the world!** 🚀
