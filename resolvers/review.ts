import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Review, Novel, User } from "../models";
import { requireAuth, requireRole } from "../lib/context";
import { ValidationError, NotFoundError, ConflictError } from "../lib/errors";
import { applyPagination, validateObjectId } from "../lib/utils";

export const reviewResolvers: GraphQLResolvers = {
  Query: {
    // Get review by ID
    review: async (_parent: any, { id }: any, context: GraphQLContext) => {
      validateObjectId(id, "Review ID");
      const review = await Review.findById(id)
        .populate("user", "name avatar")
        .populate("novel", "title coverImage");
      
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      return review;
    },

    // Get reviews by novel
    reviewsByNovel: async (_parent: any, { novelId, pagination }: any, context: GraphQLContext) => {
      validateObjectId(novelId, "Novel ID");
      
      const query = Review.findApprovedByNovel(novelId);
      return applyPagination(query, pagination);
    },

    // Get reviews by user
    reviewsByUser: async (_parent: any, { userId, pagination }: any, context: GraphQLContext) => {
      validateObjectId(userId, "User ID");
      
      const query = Review.findByUser(userId);
      return applyPagination(query, pagination);
    },
  },

  Mutation: {
    // Create review
    createReview: async (_parent: any, { input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);

      // Validate required fields
      if (!input.rating || input.rating < 1 || input.rating > 5) {
        throw new ValidationError("Rating must be between 1 and 5");
      }

      // Validate novel reference
      validateObjectId(input.novelId, "Novel ID");
      const novel = await Novel.findById(input.novelId);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      // Check if user already reviewed this novel
      const existingReview = await Review.findOne({
        user: user._id,
        novel: input.novelId,
      });

      if (existingReview) {
        throw new ConflictError("You have already reviewed this novel");
      }

      // Create new review
      const review = new Review({
        user: user._id,
        novel: input.novelId,
        rating: input.rating,
        title: input.title?.trim(),
        comment: input.comment?.trim(),
      });

      await review.save();

      return review.populate([
        { path: "user", select: "name avatar" },
        { path: "novel", select: "title coverImage" },
      ]);
    },

    // Update review
    updateReview: async (_parent: any, { id, input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(id, "Review ID");

      const review = await Review.findById(id);
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      // Check if user owns the review or is admin
      if (review.user.toString() !== user._id.toString() && user.role !== "admin") {
        throw new ValidationError("You can only update your own reviews");
      }

      // Update fields
      if (input.rating !== undefined) {
        if (input.rating < 1 || input.rating > 5) {
          throw new ValidationError("Rating must be between 1 and 5");
        }
        review.rating = input.rating;
      }

      if (input.title !== undefined) {
        review.title = input.title?.trim();
      }

      if (input.comment !== undefined) {
        review.comment = input.comment?.trim();
      }

      await review.save();

      return review.populate([
        { path: "user", select: "name avatar" },
        { path: "novel", select: "title coverImage" },
      ]);
    },

    // Delete review
    deleteReview: async (_parent: any, { id }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(id, "Review ID");

      const review = await Review.findById(id);
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      // Check if user owns the review or is admin
      if (review.user.toString() !== user._id.toString() && user.role !== "admin") {
        throw new ValidationError("You can only delete your own reviews");
      }

      await Review.findByIdAndDelete(id);

      return true;
    },

    // Vote on review helpfulness
    voteReview: async (_parent: any, { id, isHelpful }: any, context: GraphQLContext) => {
      requireAuth(context);
      validateObjectId(id, "Review ID");

      const review = await Review.findById(id);
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      await review.voteHelpful(isHelpful);

      return review.populate([
        { path: "user", select: "name avatar" },
        { path: "novel", select: "title coverImage" },
      ]);
    },

    // Moderate review (admin only)
    moderateReview: async (_parent: any, { id, input }: any, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Review ID");

      const review = await Review.findById(id);
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      await review.moderate(input.isApproved, context.user!._id.toString(), input.reason);

      return review.populate([
        { path: "user", select: "name avatar" },
        { path: "novel", select: "title coverImage" },
      ]);
    },
  },

  Review: {
    // Resolve review relationships
    user: async (parent: any, _args: any, context: GraphQLContext) => {
      if (parent.user && typeof parent.user === "object") {
        return parent.user;
      }
      return User.findById(parent.user);
    },

    novel: async (parent: any, _args: any, context: GraphQLContext) => {
      if (parent.novel && typeof parent.novel === "object") {
        return parent.novel;
      }
      return Novel.findById(parent.novel);
    },

    moderatedBy: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.moderatedBy) return null;
      if (parent.moderatedBy && typeof parent.moderatedBy === "object") {
        return parent.moderatedBy;
      }
      return User.findById(parent.moderatedBy);
    },
  },
};
