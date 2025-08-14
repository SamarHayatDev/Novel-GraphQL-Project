import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { schema } from "../../../graphql/schema";
import { resolvers } from "../../../resolvers";
import { createContext } from "../../../lib/context";
import { connectToDatabase } from "../../../lib/database";
import { handleGraphQLError } from "../../../lib/errors";

// Create Apollo Server
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return handleGraphQLError(error);
  },
  introspection: true,
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  plugins: [
    {
      requestDidStart: async () => ({
        willSendResponse: async ({ response }) => {
          // Add CORS headers
          if (response.http) {
            response.http.headers.set("Access-Control-Allow-Origin", "*");
            response.http.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.http.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
          }
        },
      }),
    },
  ],
});

// Create the handler
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // Connect to database
    await connectToDatabase();

    // Create context from request
    const headers = Object.fromEntries(req.headers.entries());
    const cookies = Object.fromEntries(
      req.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    );

    return createContext(headers, cookies);
  },
});

// Export the handler for Next.js
export { handler as GET, handler as POST };

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
