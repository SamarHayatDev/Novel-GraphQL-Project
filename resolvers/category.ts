import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Category } from "../models/Category";
import { requireRole } from "../lib/context";
import { ValidationError, NotFoundError, ConflictError } from "../lib/errors";
import { applyPagination, validateObjectId, generateSlug } from "../lib/utils";

export const categoryResolvers: GraphQLResolvers = {
  Query: {
    // Get category by ID
    category: async (_parent, { id }, context: GraphQLContext) => {
      validateObjectId(id, "Category ID");
      const category = await Category.findById(id);
      
      if (!category) {
        throw new NotFoundError("Category not found");
      }

      return category;
    },

    // Get category by slug
    categoryBySlug: async (_parent, { slug }, context: GraphQLContext) => {
      if (!slug || slug.trim().length === 0) {
        throw new ValidationError("Slug is required");
      }

      const category = await Category.findBySlug(slug.trim());
      if (!category) {
        throw new NotFoundError("Category not found");
      }

      return category;
    },

    // Get categories with pagination
    categories: async (_parent, { pagination }, context: GraphQLContext) => {
      const query = Category.findActive();
      return applyPagination(query, pagination);
    },
  },

  Mutation: {
    // Create category (admin only)
    createCategory: async (_parent, { input }, context: GraphQLContext) => {
      requireRole(context, "admin");

      // Validate required fields
      if (!input.name || input.name.trim().length < 2) {
        throw new ValidationError("Category name must be at least 2 characters");
      }

      if (!input.description || input.description.trim().length < 10) {
        throw new ValidationError("Category description must be at least 10 characters");
      }

      if (!input.slug || input.slug.trim().length === 0) {
        throw new ValidationError("Category slug is required");
      }

      // Check if category with same name or slug already exists
      const existingCategory = await Category.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${input.name}$`, "i") } },
          { slug: input.slug.trim() }
        ]
      });
      
      if (existingCategory) {
        throw new ConflictError("Category with this name or slug already exists");
      }

      // Create new category
      const category = new Category({
        name: input.name.trim(),
        description: input.description.trim(),
        slug: input.slug.trim(),
        icon: input.icon,
        color: input.color || "#3B82F6",
      });

      await category.save();

      return category;
    },

    // Update category (admin only)
    updateCategory: async (_parent, { id, input }, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Category ID");

      const category = await Category.findById(id);
      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Update fields
      if (input.name !== undefined) {
        if (input.name.trim().length < 2) {
          throw new ValidationError("Category name must be at least 2 characters");
        }
        category.name = input.name.trim();
      }

      if (input.description !== undefined) {
        if (input.description.trim().length < 10) {
          throw new ValidationError("Category description must be at least 10 characters");
        }
        category.description = input.description.trim();
      }

      if (input.slug !== undefined) {
        if (input.slug.trim().length === 0) {
          throw new ValidationError("Category slug is required");
        }
        category.slug = input.slug.trim();
      }

      if (input.icon !== undefined) {
        category.icon = input.icon;
      }

      if (input.color !== undefined) {
        category.color = input.color;
      }

      if (input.isActive !== undefined) {
        category.isActive = input.isActive;
      }

      await category.save();

      return category;
    },

    // Delete category (admin only)
    deleteCategory: async (_parent, { id }, context: GraphQLContext) => {
      requireRole(context, "admin");
      validateObjectId(id, "Category ID");

      const category = await Category.findById(id);
      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Check if category has novels
      const novelCount = await category.populate("novels");
      if (novelCount.novels && novelCount.novels.length > 0) {
        throw new ValidationError("Cannot delete category with existing novels");
      }

      await Category.findByIdAndDelete(id);

      return true;
    },
  },

  Category: {
    // Resolve category relationships
    novels: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },
  },
};
