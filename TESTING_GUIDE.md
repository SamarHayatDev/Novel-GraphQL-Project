# 🧪 Simple Testing Guide

## 🎯 **What This Guide Does**
This guide helps you test your novel website backend to make sure everything is working correctly.

## ✅ **What You Can Test**

### 🔐 **User System Tests**
- User registration (create new account)
- User login (sign in with email/password)
- Password security (passwords are encrypted)
- User roles (different user types)

### 📚 **Content Tests**
- Browse novels
- Search for novels
- Filter by category or author
- View novel details and chapters
- Check English and Urdu content

### 🖼️ **File Upload Tests**
- Upload profile pictures
- Upload novel cover images
- Check if images are processed correctly
- Verify different image formats work

### 🔍 **Search Tests**
- Search novels by title
- Search novels by description
- Filter by category
- Filter by author
- Filter by tags

## 🚀 **How to Run Tests**

### **Step 1: Start Your Server**
```bash
npm run dev
```

### **Step 2: Run the Test Script**
```bash
npm run test
```

### **Step 3: Check the Results**
The test script will show you:
- ✅ What's working perfectly
- ❌ What needs fixing
- 📊 Overall test results

## 📋 **Manual Testing Checklist**

### **User Registration Test**
1. Try to register a new user
2. Check if the account is created
3. Verify the password is encrypted
4. Test with invalid data (should show errors)

### **User Login Test**
1. Try to login with correct credentials
2. Check if you get a JWT token
3. Test with wrong password (should fail)
4. Test with non-existent email (should fail)

### **Novel Browsing Test**
1. Get list of all novels
2. Check if novel details are complete
3. Verify author and category information
4. Test pagination (if many novels)

### **Search Test**
1. Search for a novel by title
2. Search for a novel by description
3. Filter by category
4. Filter by author
5. Check if results are relevant

### **File Upload Test**
1. Upload a profile picture
2. Upload a novel cover
3. Check if images are resized
4. Verify different formats (JPEG, PNG, WebP)

### **API Test**
1. Test GraphQL schema introspection
2. Check if all queries work
3. Verify error handling
4. Test authentication requirements

## 🔧 **Testing Tools**

### **GraphQL Playground**
Visit `http://localhost:3000/graphql` to test queries manually.

### **Example Queries**

**Test User Registration:**
```graphql
mutation {
  register(input: {
    name: "Test User"
    email: "test@example.com"
    password: "TestPass123!"
  }) {
    user {
      id
      name
      email
    }
    token
  }
}
```

**Test Novel Search:**
```graphql
query {
  novels(
    pagination: { page: 1, limit: 10 }
    filter: { search: "fantasy" }
  ) {
    data {
      id
      title
      description
      author {
        name
      }
    }
    pagination {
      total
      page
      limit
    }
  }
}
```

**Test File Upload:**
```graphql
mutation {
  uploadImage(input: {
    base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
    type: AVATAR
  }) {
    success
    filename
    url
  }
}
```

## 📊 **What Good Test Results Look Like**

### ✅ **All Tests Pass**
```
🧪 Testing Complete!
✅ User Registration: Working
✅ User Login: Working
✅ Novel Browsing: Working
✅ Search & Filtering: Working
✅ File Uploads: Working
✅ API Endpoints: Working

🎉 All tests passed! Your backend is ready!
```

### ⚠️ **Some Tests Fail**
```
🧪 Testing Complete!
✅ User Registration: Working
❌ User Login: Failed
✅ Novel Browsing: Working
⚠️ Search & Filtering: Partially Working
✅ File Uploads: Working
✅ API Endpoints: Working

🔧 Some issues found. Check the error messages above.
```

## 🆘 **Common Test Issues & Solutions**

### **Problem: "Database connection failed"**
**Solution**: 
- Check if MongoDB is running
- Verify your connection string
- Make sure network connection is working

### **Problem: "Authentication failed"**
**Solution**:
- Check if JWT_SECRET is set
- Verify password hashing is working
- Test with correct credentials

### **Problem: "File upload failed"**
**Solution**:
- Check if upload folders exist
- Verify file permissions
- Test with smaller images first

### **Problem: "Search not working"**
**Solution**:
- Check if database has sample data
- Verify search queries are correct
- Test with simple search terms

## 📈 **Performance Testing**

### **Speed Tests**
1. **Database Queries**: Should be fast (< 100ms)
2. **Image Uploads**: Should process quickly (< 5 seconds)
3. **Search Results**: Should return quickly (< 200ms)
4. **API Responses**: Should be responsive (< 500ms)

### **Load Tests**
1. **Multiple Users**: Test with several users at once
2. **Large Data**: Test with many novels and chapters
3. **File Uploads**: Test multiple uploads simultaneously
4. **Search Queries**: Test many search requests

## 🎯 **Testing Best Practices**

### **Before Testing**
1. Make sure your server is running
2. Check that database is connected
3. Verify environment variables are set
4. Clear any old test data

### **During Testing**
1. Test one feature at a time
2. Write down any errors you find
3. Test both valid and invalid inputs
4. Check error messages are helpful

### **After Testing**
1. Review all test results
2. Fix any issues found
3. Re-test after fixes
4. Document any problems

## 🎉 **Success Criteria**

Your backend is working perfectly when:
- ✅ All user features work (register, login, profiles)
- ✅ All content features work (novels, authors, categories)
- ✅ All search features work (search, filter, browse)
- ✅ All file uploads work (images, processing)
- ✅ All API endpoints respond correctly
- ✅ Error handling works properly
- ✅ Performance is acceptable

## 📞 **Getting Help**

### **If Tests Fail**
1. Check the error messages carefully
2. Look at the server logs
3. Verify your setup is correct
4. Test individual features manually

### **Useful Commands**
```bash
# Start the server
npm run dev

# Run tests
npm run test

# Check server logs
tail -f logs/server.log

# Test database connection
npm run test:db
```

---

## 🎊 **Final Testing Checklist**

Before deploying to production, make sure:
- [ ] All user features work
- [ ] All content features work
- [ ] All search features work
- [ ] All file uploads work
- [ ] All API endpoints work
- [ ] Error handling works
- [ ] Performance is good
- [ ] Security features work

**If everything passes, your backend is ready for production!** 🚀
