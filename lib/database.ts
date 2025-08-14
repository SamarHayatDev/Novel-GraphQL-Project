import mongoose from "mongoose";

// Load environment variables if not already loaded
if (!process.env.MONGODB_URI) {
  try {
    require("dotenv").config({
      path: require("path").join(process.cwd(), ".env.local"),
    });
  } catch (error) {
    // Ignore if dotenv is not available
  }
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface ConnectionState {
  isConnected: boolean;
}

const connection: ConnectionState = {
  isConnected: false,
};

export const connectToDatabase = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    connection.isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!connection.isConnected) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    await mongoose.disconnect();
    connection.isConnected = false;
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
