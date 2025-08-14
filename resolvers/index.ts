import { GraphQLResolvers } from "../types/graphql";
import { userResolvers } from "./user";
import { authorResolvers } from "./author";
import { categoryResolvers } from "./category";
import { tagResolvers } from "./tag";
import { novelResolvers } from "./novel";
import { chapterResolvers } from "./chapter";
import { reviewResolvers } from "./review";
import { interactionResolvers } from "./interaction";
import { adminResolvers } from "./admin";
import { uploadResolvers } from "./upload";
import { scalars } from "../graphql/scalars";

// Combine all resolvers
export const resolvers: GraphQLResolvers = {
  // Scalars
  ...scalars,

  // Query resolvers
  Query: {
    ...userResolvers.Query,
    ...authorResolvers.Query,
    ...categoryResolvers.Query,
    ...tagResolvers.Query,
    ...novelResolvers.Query,
    ...chapterResolvers.Query,
    ...reviewResolvers.Query,
    ...interactionResolvers.Query,
    ...adminResolvers.Query,
  },

  // Mutation resolvers
  Mutation: {
    ...userResolvers.Mutation,
    ...authorResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...tagResolvers.Mutation,
    ...novelResolvers.Mutation,
    ...chapterResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...interactionResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...uploadResolvers.Mutation,
  },

  // Type resolvers
  User: userResolvers.User,
  Author: authorResolvers.Author,
  Category: categoryResolvers.Category,
  Tag: tagResolvers.Tag,
  Novel: novelResolvers.Novel,
  Chapter: chapterResolvers.Chapter,
  Review: reviewResolvers.Review,
  Favorite: interactionResolvers.Favorite,
  Bookmark: interactionResolvers.Bookmark,
  ReadingProgress: interactionResolvers.ReadingProgress,
};
