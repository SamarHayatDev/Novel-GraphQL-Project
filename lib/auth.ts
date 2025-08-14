import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// JWT Token Interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT Token
export const generateToken = (
  payload: Omit<JWTPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "novel-graphql-api",
    audience: "novel-graphql-client",
  } as jwt.SignOptions);
};

// Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare Password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate Random Token (for email verification, password reset)
export const generateRandomToken = (length: number = 32): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Authenticate User
export const authenticateUser = async (
  email: string,
  password: string
): Promise<IUser> => {
  // Find user by email and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Get User from Token
export const getUserFromToken = async (token: string): Promise<IUser> => {
  const payload = verifyToken(token);
  const user = await User.findById(payload.userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  return user;
};

// Check if user has required role
export const hasRole = (user: IUser, requiredRole: string): boolean => {
  if (user.role === "admin") return true; // Admin has access to everything
  return user.role === requiredRole;
};

// Check if user has any of the required roles
export const hasAnyRole = (user: IUser, requiredRoles: string[]): boolean => {
  if (user.role === "admin") return true; // Admin has access to everything
  return requiredRoles.includes(user.role);
};

// Extract token from Authorization header
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string => {
  if (!authHeader) {
    throw new Error("Authorization header is required");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header format");
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
};

// Create user session data (without sensitive information)
export const createUserSession = (user: IUser) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role.toUpperCase(),
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  };
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
