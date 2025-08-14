import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Review, User, Novel, Chapter } from "../models";
import { requireRole } from "../lib/context";
import { applyPagination } from "../lib/utils";

export const adminResolvers: GraphQLResolvers = {
  Query: {
    // Get pending reviews for moderation
    pendingReviews: async (_parent: any, { pagination }: any, context: GraphQLContext) => {
      requireRole(context, "admin");
      
      const query = Review.findNeedingModeration();
      return applyPagination(query, pagination);
    },

    // Get user statistics
    userStats: async (_parent: any, _args: any, context: GraphQLContext) => {
      requireRole(context, "admin");

      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isEmailVerified: true }),
      ]);

      // Calculate new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth },
      });

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        verifiedUsers,
      };
    },

    // Get novel statistics
    novelStats: async (_parent: any, _args: any, context: GraphQLContext) => {
      requireRole(context, "admin");

      const [
        totalNovels,
        publishedNovels,
        totalChapters,
        totalViews,
        totalFavorites,
      ] = await Promise.all([
        Novel.countDocuments(),
        Novel.countDocuments({ isPublished: true }),
        Chapter.countDocuments(),
        Novel.aggregate([
          { $group: { _id: null, total: { $sum: "$totalViews" } } },
        ]).then(result => result[0]?.total || 0),
        Novel.aggregate([
          { $group: { _id: null, total: { $sum: "$totalFavorites" } } },
        ]).then(result => result[0]?.total || 0),
      ]);

      return {
        totalNovels,
        publishedNovels,
        totalChapters,
        totalViews,
        totalFavorites,
      };
    },
  },

  Mutation: {
    // Upload image (returns base64 string)
    uploadImage: async (_parent: any, { file }: any, context: GraphQLContext) => {
      requireRole(context, "admin");
      
      // This is a placeholder implementation
      // In a real application, you would:
      // 1. Process the uploaded file
      // 2. Convert it to base64
      // 3. Optionally compress it
      // 4. Return the base64 string
      
      return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
    },
  },
};
