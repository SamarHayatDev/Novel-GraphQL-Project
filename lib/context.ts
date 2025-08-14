import { IUser } from "../models/User";

// GraphQL Context Interface
export interface GraphQLContext {
  user?: IUser;
  isAuthenticated: boolean;
  token?: string;
}

// Request Context Interface (for Next.js API routes)
export interface RequestContext {
  user?: IUser;
  isAuthenticated: boolean;
  token?: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

// Create context from request
export const createContext = async (
  headers: Record<string, string>,
  cookies: Record<string, string> = {}
): Promise<GraphQLContext> => {
  try {
    const authHeader = headers.authorization || headers.Authorization;
    const tokenFromCookie = cookies.token || cookies.Token;

    if (!authHeader && !tokenFromCookie) {
      return {
        isAuthenticated: false,
      };
    }

    const token = authHeader 
      ? authHeader.replace("Bearer ", "")
      : tokenFromCookie;

    if (!token) {
      return {
        isAuthenticated: false,
      };
    }

    // Import here to avoid circular dependencies
    const { getUserFromToken } = await import("./auth");
    const user = await getUserFromToken(token);
    
    if (!user) {
      return {
        isAuthenticated: false,
      };
    }

    return {
      user,
      isAuthenticated: true,
      token,
    };
  } catch (error) {
    console.error("Error creating context:", error);
    return {
      isAuthenticated: false,
    };
  }
};

// Check if user is authenticated
export const requireAuth = (context: GraphQLContext): IUser => {
  if (!context.isAuthenticated || !context.user) {
    throw new Error("Authentication required");
  }
  return context.user;
};

// Check if user has specific role
export const requireRole = (context: GraphQLContext, role: string): IUser => {
  const user = requireAuth(context);
  
  // Import here to avoid circular dependencies
  const { hasRole } = require("./auth");
  
  if (!hasRole(user, role)) {
    throw new Error(`Access denied. ${role} role required.`);
  }
  
  return user;
};

// Check if user has any of the specified roles
export const requireAnyRole = (context: GraphQLContext, roles: string[]): IUser => {
  const user = requireAuth(context);
  
  // Import here to avoid circular dependencies
  const { hasAnyRole } = require("./auth");
  
  if (!hasAnyRole(user, roles)) {
    throw new Error(`Access denied. One of these roles required: ${roles.join(", ")}`);
  }
  
  return user;
};

// Optional authentication (returns user if authenticated, undefined if not)
export const optionalAuth = (context: GraphQLContext): IUser | undefined => {
  return context.isAuthenticated ? context.user : undefined;
};
