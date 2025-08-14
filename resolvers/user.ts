import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { User } from "../models/User";
import { 
  generateToken, 
  authenticateUser, 
  hashPassword, 
  generateRandomToken,
  isValidEmail,
  validatePasswordStrength,
  createUserSession 
} from "../lib/auth";
import { 
  requireAuth, 
  requireRole, 
  optionalAuth 
} from "../lib/context";
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError,
  AuthenticationError 
} from "../lib/errors";
import { applyPagination, validateObjectId } from "../lib/utils";

export const userResolvers: GraphQLResolvers = {
  Query: {
    // Get current user
    me: async (_parent, _args, context: GraphQLContext) => {
      console.log("Context in me query:", { 
        isAuthenticated: context.isAuthenticated, 
        hasUser: !!context.user,
        userId: context.user?._id 
      });
      
      if (!context.isAuthenticated || !context.user) {
        return null;
      }
      
      return createUserSession(context.user);
    },

    // Get user by ID
    user: async (_parent, { id }, context: GraphQLContext) => {
      validateObjectId(id, "User ID");
      const user = await User.findById(id).select("-password");
      
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return user;
    },

    // Get users with pagination
    users: async (_parent, { pagination }, context: GraphQLContext) => {
      requireRole(context, "admin");
      
      const query = User.find().select("-password");
      return applyPagination(query, pagination);
    },
  },

  Mutation: {
    // Register new user
    register: async (_parent, { input }, context: GraphQLContext) => {
      // Validate input
      if (!isValidEmail(input.email)) {
        throw new ValidationError("Invalid email format");
      }

      const passwordValidation = validatePasswordStrength(input.password);
      if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.errors.join(", "));
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: input.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      // Create new user
      const user = new User({
        name: input.name,
        email: input.email.toLowerCase(),
        password: input.password,
        role: (input.role || "READER").toLowerCase(),
      });

      await user.save();

      // Generate tokens
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRandomToken(64);

      return {
        user: createUserSession(user),
        token,
        refreshToken,
      };
    },

    // Login user
    login: async (_parent, { input }, context: GraphQLContext) => {
      // Validate input
      if (!isValidEmail(input.email)) {
        throw new ValidationError("Invalid email format");
      }

      // Authenticate user
      const user = await authenticateUser(input.email, input.password);

      // Generate tokens
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRandomToken(64);

      return {
        user: createUserSession(user),
        token,
        refreshToken,
      };
    },

    // Refresh token
    refreshToken: async (_parent, _args, context: GraphQLContext) => {
      const user = requireAuth(context);

      // Generate new tokens
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRandomToken(64);

      return {
        user: createUserSession(user),
        token,
        refreshToken,
      };
    },

    // Logout user
    logout: async (_parent, _args, context: GraphQLContext) => {
      // In a real implementation, you might want to invalidate the token
      // For now, we'll just return true
      return true;
    },

    // Update user profile
    updateProfile: async (_parent, { input }, context: GraphQLContext) => {
      const user = requireAuth(context);

      // Update allowed fields
      if (input.name !== undefined) {
        user.name = input.name;
      }
      if (input.bio !== undefined) {
        user.bio = input.bio;
      }
      if (input.avatar !== undefined) {
        user.avatar = input.avatar;
      }

      await user.save();

      return user;
    },

    // Change password
    changePassword: async (_parent, { input }, context: GraphQLContext) => {
      const user = requireAuth(context);

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(input.currentPassword);
      if (!isCurrentPasswordValid) {
        throw new ValidationError("Current password is incorrect");
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(input.newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.errors.join(", "));
      }

      // Update password
      user.password = input.newPassword;
      await user.save();

      return true;
    },

    // Request password reset
    requestPasswordReset: async (_parent, { email }, context: GraphQLContext) => {
      if (!isValidEmail(email)) {
        throw new ValidationError("Invalid email format");
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if user exists or not
        return true;
      }

      // Generate reset token
      const resetToken = generateRandomToken(32);
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      // In a real implementation, send email with reset token
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return true;
    },

    // Reset password
    resetPassword: async (_parent, { input }, context: GraphQLContext) => {
      const user = await User.findOne({
        passwordResetToken: input.token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new ValidationError("Invalid or expired reset token");
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(input.newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.errors.join(", "));
      }

      // Update password and clear reset token
      user.password = input.newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return true;
    },

    // Verify email
    verifyEmail: async (_parent, { token }, context: GraphQLContext) => {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new ValidationError("Invalid or expired verification token");
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return true;
    },

    // Request email verification
    requestEmailVerification: async (_parent, _args, context: GraphQLContext) => {
      const user = requireAuth(context);

      if (user.isEmailVerified) {
        throw new ValidationError("Email is already verified");
      }

      // Generate verification token
      const verificationToken = generateRandomToken(32);
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      // In a real implementation, send email with verification token
      console.log(`Email verification token for ${user.email}: ${verificationToken}`);

      return true;
    },
  },

  User: {
    // Resolve user relationships
    reviews: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },

    favorites: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },

    bookmarks: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },

    readingProgress: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },
  },
};
