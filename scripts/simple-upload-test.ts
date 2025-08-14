import { config } from "dotenv";
import path from "path";
import fetch from "node-fetch";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

const API_URL = "http://localhost:3000/api/graphql";

async function simpleUploadTest() {
  console.log("🧪 Simple Upload Test...\n");

  try {
    // Step 1: Login to get token
    console.log("1. Logging in...");
    const loginResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation {
            login(input: { email: "reader1@novel.com", password: "ReaderPass123!" }) {
              token
              user {
                id
                name
              }
            }
          }
        `,
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginData.errors) {
      console.error("❌ Login failed:", loginData.errors);
      return;
    }

    const token = loginData.data.login.token;
    console.log("✅ Login successful");

    // Step 2: Test a simple query to verify authentication
    console.log("\n2. Testing authentication...");
    const authTestResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{ me { id name email } }`,
      }),
    });

    const authTestData = await authTestResponse.json();
    
    if (authTestData.errors) {
      console.error("❌ Auth test failed:", authTestData.errors);
      return;
    }

    console.log("✅ Authentication working:", authTestData.data.me);

    // Step 3: Test upload with minimal data
    console.log("\n3. Testing upload...");
    const uploadResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            uploadImage(input: {
              base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
              type: AVATAR
            }) {
              success
              filename
              url
            }
          }
        `,
      }),
    });

    const uploadData = await uploadResponse.json();
    console.log("Upload response:", JSON.stringify(uploadData, null, 2));

    if (uploadData.errors) {
      console.error("❌ Upload failed:", uploadData.errors);
    } else {
      console.log("✅ Upload successful!");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

simpleUploadTest();
