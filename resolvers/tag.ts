import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Tag } from "../models/Tag";
import { requireRole } from "../lib/context";
import { ValidationError, NotFoundError, ConflictError } from "../lib/errors";
import { applyPagination, validateObjectId, generateSlug } from "../lib/utils";

export const tagResolvers: GraphQLResolvers = {
  Query: {
    // Get tag by ID
    tag: async (_parent, { id }, context: GraphQLContext) => {
      validateObjectId(id, "Tag ID");
      const tag = await Tag.findById(id);
      
      if (!tag) {
        throw new NotFoundError("Tag not found");
      }

      return tag;
    },

    // Get tag by slug
    tagBySlug: async (_parent, { slug }, context: GraphQLContext) => {
      if (!slug || slug.trim().length === 0) {
        throw new ValidationError("Slug is required");
      }

      const tag = await Tag.findBySlug(slug.trim());
      if (!tag) {
        throw new NotFoundError("Tag not found");
      }

      return tag;
    },

    // Get tags with pagination
    tags: async (_parent, { pagination }, context: GraphQLContext) => {
      const query = Tag.findActive();
      return applyPagination(query, pagination);
    },

    // Search tags by name
    searchTags: async (_parent, { search }, context: GraphQLContext) => {
      if (!search || search.trim().length < 2) {
        throw new ValidationError("Search term must be at least 2 characters");
      }

      return Tag.searchByName(search.trim());
    },
  },

  Mutation: {
    // Create tag (admin only)
    createTag: async (_parent, { input }, context: GraphQLContext) => {
      requireRole(context, "admin");

      // Validate required fields
      if (!input.name || input.name.trim().length < 2) {
        throw new ValidationError("Tag name must be at least 2 characters");
      }

      if (!input.slug || input.slug.trim().length === 0) {
        throw new ValidationError("Tag slug is required");
      }

      // Check if tag with same name or slug already exists
      const existingTag = await Tag.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${input.name}$`, "i") } },
          { slug: input.slug.trim() }
        ]
      });
      
      if (existingTag) {
        throw new ConflictError("Tag with this name or slug already exists");
      }

      // Create new tag
      const tag = new Tag({
        name: input.name.trim(),
        description: input.description?.trim(),
        slug: input.slug.trim(),
        color: input.color || "#6B7280",
      });

      await tag.save();

      return tag;
    },

    // Update tag (admin only)
    updateTag: async (_parent, { id, input }, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Tag ID");

      const tag = await Tag.findById(id);
      if (!tag) {
        throw new NotFoundError("Tag not found");
      }

      // Update fields
      if (input.name !== undefined) {
        if (input.name.trim().length < 2) {
          throw new ValidationError("Tag name must be at least 2 characters");
        }
        tag.name = input.name.trim();
      }

      if (input.description !== undefined) {
        tag.description = input.description?.trim();
      }

      if (input.slug !== undefined) {
        if (input.slug.trim().length === 0) {
          throw new ValidationError("Tag slug is required");
        }
        tag.slug = input.slug.trim();
      }

      if (input.color !== undefined) {
        tag.color = input.color;
      }

      if (input.isActive !== undefined) {
        tag.isActive = input.isActive;
      }

      await tag.save();

      return tag;
    },

    // Delete tag (admin only)
    deleteTag: async (_parent, { id }, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Tag ID");

      const tag = await Tag.findById(id);
      if (!tag) {
        throw new NotFoundError("Tag not found");
      }

      // Check if tag has novels
      const novelCount = await tag.populate("novels");
      if (novelCount.novels && novelCount.novels.length > 0) {
        throw new ValidationError("Cannot delete tag with existing novels");
      }

      await Tag.findByIdAndDelete(id);

      return true;
    },
  },

  Tag: {
    // Resolve tag relationships
    novels: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },
  },
};
