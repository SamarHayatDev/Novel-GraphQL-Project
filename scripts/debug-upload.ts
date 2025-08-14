import { config } from "dotenv";
import path from "path";
import fetch from "node-fetch";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

const API_URL = "http://localhost:3000/api/graphql";

async function debugUpload() {
  console.log("🔍 Debugging Upload System...\n");

  try {
    // Test 1: Check if server is running
    console.log("1. Testing server connection...");
    const testResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{ __schema { types { name } } }`,
      }),
    });

    if (!testResponse.ok) {
      console.error("❌ Server not responding");
      return;
    }
    console.log("✅ Server is running");

    // Test 2: Check upload mutation exists
    console.log("\n2. Checking upload mutation...");
    const mutationResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          __type(name: "Mutation") {
            fields {
              name
              type {
                name
              }
            }
          }
        }`,
      }),
    });

    const mutationData = await mutationResponse.json();
    const uploadField = mutationData.data.__type.fields.find((f: any) => f.name === 'uploadImage');
    
    if (uploadField) {
      console.log("✅ Upload mutation exists:", uploadField);
    } else {
      console.log("❌ Upload mutation not found");
      console.log("Available mutations:", mutationData.data.__type.fields.map((f: any) => f.name));
      return;
    }

    // Test 3: Check upload input type
    console.log("\n3. Checking upload input type...");
    const inputResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          __type(name: "UploadImageInput") {
            inputFields {
              name
              type {
                name
                kind
              }
            }
          }
        }`,
      }),
    });

    const inputData = await inputResponse.json();
    console.log("✅ Upload input fields:", inputData.data.__type.inputFields);

    // Test 4: Try a simple upload with minimal data
    console.log("\n4. Testing simple upload...");
    const simpleUploadResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `mutation {
          uploadImage(input: {
            base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
            type: AVATAR
          }) {
            success
          }
        }`,
      }),
    });

    const simpleUploadData = await simpleUploadResponse.json();
    console.log("Upload response:", JSON.stringify(simpleUploadData, null, 2));

  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugUpload();
