import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Author } from "../models/Author";
import { requireRole, requireAuth } from "../lib/context";
import { ValidationError, NotFoundError, ConflictError } from "../lib/errors";
import { applyPagination, validateObjectId, generateSlug } from "../lib/utils";

export const authorResolvers: GraphQLResolvers = {
  Query: {
    // Get author by ID
    author: async (_parent, { id }, context: GraphQLContext) => {
      validateObjectId(id, "Author ID");
      const author = await Author.findById(id);
      
      if (!author) {
        throw new NotFoundError("Author not found");
      }

      return author;
    },

    // Get authors with pagination
    authors: async (_parent, { pagination }, context: GraphQLContext) => {
      const query = Author.findActive();
      return applyPagination(query, pagination);
    },

    // Search authors by name
    searchAuthors: async (_parent, { search }, context: GraphQLContext) => {
      if (!search || search.trim().length < 2) {
        throw new ValidationError("Search term must be at least 2 characters");
      }

      return Author.searchByName(search.trim());
    },
  },

  Mutation: {
    // Create author (admin only)
    createAuthor: async (_parent, { input }, context: GraphQLContext) => {
      requireRole(context, "admin");

      // Validate required fields
      if (!input.name || input.name.trim().length < 2) {
        throw new ValidationError("Author name must be at least 2 characters");
      }

      if (!input.bio || input.bio.trim().length < 10) {
        throw new ValidationError("Author bio must be at least 10 characters");
      }

      // Check if author with same name already exists
      const existingAuthor = await Author.findOne({ 
        name: { $regex: new RegExp(`^${input.name}$`, "i") } 
      });
      
      if (existingAuthor) {
        throw new ConflictError("Author with this name already exists");
      }

      // Create new author
      const author = new Author({
        name: input.name.trim(),
        bio: input.bio.trim(),
        avatar: input.avatar,
        website: input.website,
        socialLinks: input.socialLinks,
        birthDate: input.birthDate,
        nationality: input.nationality,
      });

      await author.save();

      return author;
    },

    // Update author (admin only)
    updateAuthor: async (_parent, { id, input }, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Author ID");

      const author = await Author.findById(id);
      if (!author) {
        throw new NotFoundError("Author not found");
      }

      // Update fields
      if (input.name !== undefined) {
        if (input.name.trim().length < 2) {
          throw new ValidationError("Author name must be at least 2 characters");
        }
        author.name = input.name.trim();
      }

      if (input.bio !== undefined) {
        if (input.bio.trim().length < 10) {
          throw new ValidationError("Author bio must be at least 10 characters");
        }
        author.bio = input.bio.trim();
      }

      if (input.avatar !== undefined) {
        author.avatar = input.avatar;
      }

      if (input.website !== undefined) {
        author.website = input.website;
      }

      if (input.socialLinks !== undefined) {
        author.socialLinks = input.socialLinks;
      }

      if (input.birthDate !== undefined) {
        author.birthDate = input.birthDate;
      }

      if (input.nationality !== undefined) {
        author.nationality = input.nationality;
      }

      if (input.isActive !== undefined) {
        author.isActive = input.isActive;
      }

      await author.save();

      return author;
    },

    // Delete author (admin only)
    deleteAuthor: async (_parent, { id }, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Author ID");

      const author = await Author.findById(id);
      if (!author) {
        throw new NotFoundError("Author not found");
      }

      // Check if author has novels
      const novelCount = await author.populate("novels");
      if (novelCount.novels && novelCount.novels.length > 0) {
        throw new ValidationError("Cannot delete author with existing novels");
      }

      await Author.findByIdAndDelete(id);

      return true;
    },
  },

  Author: {
    // Resolve author relationships
    novels: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },
  },
};
