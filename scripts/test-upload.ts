import { config } from "dotenv";
import path from "path";
import fetch from "node-fetch";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

const API_URL = "http://localhost:3000/api/graphql";

// Simple test image base64 (1x1 pixel JPEG)
const TEST_IMAGE_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

async function testUpload() {
  console.log("🧪 Testing File Upload System...\n");

  try {
    // First, get a valid token by logging in
    console.log("1. Getting authentication token...");
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
    console.log("✅ Login successful, token obtained");

    // Test avatar upload
    console.log("\n2. Testing avatar upload...");
    const uploadResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation UploadAvatar($input: UploadImageInput!) {
            uploadImage(input: $input) {
              success
              filename
              originalName
              mimetype
              size
              width
              height
              url
              thumbnailUrl
            }
          }
        `,
        variables: {
          input: {
            base64Data: TEST_IMAGE_BASE64,
            type: "AVATAR",
            folder: "avatars"
          }
        }
      }),
    });

    const uploadData = await uploadResponse.json();
    
    if (uploadData.errors) {
      console.error("❌ Upload failed:", uploadData.errors);
      return;
    }

    console.log("✅ Upload successful!");
    console.log("📁 File details:", uploadData.data.uploadImage);

    // Test cover upload
    console.log("\n3. Testing cover upload...");
    const coverResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation UploadCover($input: UploadImageInput!) {
            uploadImage(input: $input) {
              success
              filename
              url
              thumbnailUrl
            }
          }
        `,
        variables: {
          input: {
            base64Data: TEST_IMAGE_BASE64,
            type: "COVER",
            folder: "covers"
          }
        }
      }),
    });

    const coverData = await coverResponse.json();
    
    if (coverData.errors) {
      console.error("❌ Cover upload failed:", coverData.errors);
      return;
    }

    console.log("✅ Cover upload successful!");
    console.log("📁 Cover details:", coverData.data.uploadImage);

    console.log("\n🎉 All upload tests passed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testUpload();
