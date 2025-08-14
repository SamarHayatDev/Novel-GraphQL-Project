import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Novel, Author, Category, Tag } from "../models";
import { requireRole, requireAnyRole } from "../lib/context";
import { ValidationError, NotFoundError, ConflictError } from "../lib/errors";
import {
  applyPagination,
  validateObjectId,
  createNovelFilter,
  createSortOptions,
} from "../lib/utils";

export const novelResolvers: GraphQLResolvers = {
  Novel: {
    status: (novel: any) => {
      if (!novel.status) return null;
      return novel.status.toUpperCase();
    },
  },
  Query: {
    // Get novel by ID
    novel: async (_parent, { id }, context: GraphQLContext) => {
      validateObjectId(id, "Novel ID");
      const novel = await Novel.findById(id)
        .populate("author", "name avatar")
        .populate("category", "name slug")
        .populate("tags", "name slug color");

      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      // Transform status to uppercase for GraphQL enum
      const novelObj = novel.toObject();
      if (novelObj.status) {
        novelObj.status = novelObj.status.toUpperCase();
      }

      return novelObj;
    },

        // Get novels with filtering and pagination
    novels: async (
      _parent,
      { filter, pagination, sortBy, sortOrder },
      context: GraphQLContext
    ) => {
      const queryFilter = createNovelFilter(filter || {});
      const sortOptions = createSortOptions(sortBy, sortOrder);
      
      const query = Novel.find(queryFilter)
        .populate("author", "name avatar")
        .populate("category", "name slug")
        .populate("tags", "name slug color")
        .sort(sortOptions);

      const result = await applyPagination(query, pagination);
      
      // Transform status to uppercase for GraphQL enum
      result.data = result.data.map((novel: any) => {
        const novelObj = novel.toObject ? novel.toObject() : novel;
        if (novelObj.status) {
          novelObj.status = novelObj.status.toUpperCase();
        }
        return novelObj;
      });

      return result;
    },

    // Search novels
    searchNovels: async (_parent, { search }, context: GraphQLContext) => {
      if (!search || search.trim().length < 2) {
        throw new ValidationError("Search term must be at least 2 characters");
      }

      return Novel.search(search.trim());
    },

    // Get novels by author
    novelsByAuthor: async (
      _parent,
      { authorId, pagination },
      context: GraphQLContext
    ) => {
      validateObjectId(authorId, "Author ID");

      const query = Novel.findByAuthor(authorId);
      return applyPagination(query, pagination);
    },

    // Get novels by category
    novelsByCategory: async (
      _parent,
      { categoryId, pagination },
      context: GraphQLContext
    ) => {
      validateObjectId(categoryId, "Category ID");

      const query = Novel.findByCategory(categoryId);
      return applyPagination(query, pagination);
    },

    // Get novels by tag
    novelsByTag: async (
      _parent,
      { tagId, pagination },
      context: GraphQLContext
    ) => {
      validateObjectId(tagId, "Tag ID");

      const query = Novel.find({
        tags: tagId,
        isPublished: true,
      })
        .populate("author", "name avatar")
        .populate("category", "name slug")
        .populate("tags", "name slug color");

      return applyPagination(query, pagination);
    },
  },

  Mutation: {
    // Create novel
    createNovel: async (_parent, { input }, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);

      // Validate required fields
      if (!input.title || input.title.trim().length < 2) {
        throw new ValidationError("Novel title must be at least 2 characters");
      }

      if (!input.description || input.description.trim().length < 10) {
        throw new ValidationError(
          "Novel description must be at least 10 characters"
        );
      }

      // Validate references
      validateObjectId(input.authorId, "Author ID");
      validateObjectId(input.categoryId, "Category ID");

      const author = await Author.findById(input.authorId);
      if (!author) {
        throw new NotFoundError("Author not found");
      }

      const category = await Category.findById(input.categoryId);
      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Validate tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        for (const tagId of input.tagIds) {
          validateObjectId(tagId, "Tag ID");
        }

        const tags = await Tag.find({ _id: { $in: input.tagIds } });
        if (tags.length !== input.tagIds.length) {
          throw new NotFoundError("One or more tags not found");
        }
      }

      // Create new novel
      const novel = new Novel({
        title: input.title.trim(),
        titleUrdu: input.titleUrdu?.trim(),
        description: input.description.trim(),
        descriptionUrdu: input.descriptionUrdu?.trim(),
        author: input.authorId,
        category: input.categoryId,
        tags: input.tagIds || [],
        coverImage: input.coverImage,
        status: input.status || "ongoing",
        language: input.language || "english",
        totalChapters: input.totalChapters || 0,
      });

      await novel.save();

      return novel.populate([
        { path: "author", select: "name avatar" },
        { path: "category", select: "name slug" },
        { path: "tags", select: "name slug color" },
      ]);
    },

    // Update novel
    updateNovel: async (_parent, { id, input }, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Novel ID");

      const novel = await Novel.findById(id);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      // Update fields
      if (input.title !== undefined) {
        if (input.title.trim().length < 2) {
          throw new ValidationError(
            "Novel title must be at least 2 characters"
          );
        }
        novel.title = input.title.trim();
      }

      if (input.titleUrdu !== undefined) {
        novel.titleUrdu = input.titleUrdu?.trim();
      }

      if (input.description !== undefined) {
        if (input.description.trim().length < 10) {
          throw new ValidationError(
            "Novel description must be at least 10 characters"
          );
        }
        novel.description = input.description.trim();
      }

      if (input.descriptionUrdu !== undefined) {
        novel.descriptionUrdu = input.descriptionUrdu?.trim();
      }

      if (input.authorId !== undefined) {
        validateObjectId(input.authorId, "Author ID");
        const author = await Author.findById(input.authorId);
        if (!author) {
          throw new NotFoundError("Author not found");
        }
        novel.author = input.authorId;
      }

      if (input.categoryId !== undefined) {
        validateObjectId(input.categoryId, "Category ID");
        const category = await Category.findById(input.categoryId);
        if (!category) {
          throw new NotFoundError("Category not found");
        }
        novel.category = input.categoryId;
      }

      if (input.tagIds !== undefined) {
        if (input.tagIds.length > 0) {
          for (const tagId of input.tagIds) {
            validateObjectId(tagId, "Tag ID");
          }

          const tags = await Tag.find({ _id: { $in: input.tagIds } });
          if (tags.length !== input.tagIds.length) {
            throw new NotFoundError("One or more tags not found");
          }
        }
        novel.tags = input.tagIds;
      }

      if (input.coverImage !== undefined) {
        novel.coverImage = input.coverImage;
      }

      if (input.status !== undefined) {
        novel.status = input.status;
      }

      if (input.language !== undefined) {
        novel.language = input.language;
      }

      if (input.totalChapters !== undefined) {
        novel.totalChapters = input.totalChapters;
      }

      await novel.save();

      return novel.populate([
        { path: "author", select: "name avatar" },
        { path: "category", select: "name slug" },
        { path: "tags", select: "name slug color" },
      ]);
    },

    // Delete novel
    deleteNovel: async (_parent, { id }, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Novel ID");

      const novel = await Novel.findById(id);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      await Novel.findByIdAndDelete(id);

      return true;
    },

    // Publish novel
    publishNovel: async (_parent, { id }, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Novel ID");

      const novel = await Novel.findById(id);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      novel.isPublished = true;
      novel.publishedAt = new Date();
      await novel.save();

      return novel;
    },

    // Unpublish novel
    unpublishNovel: async (_parent, { id }, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Novel ID");

      const novel = await Novel.findById(id);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      novel.isPublished = false;
      novel.publishedAt = undefined;
      await novel.save();

      return novel;
    },
  },

  Novel: {
    // Resolve novel relationships
    author: async (parent, _args, context: GraphQLContext) => {
      if (parent.author && typeof parent.author === "object") {
        return parent.author;
      }
      return Author.findById(parent.author);
    },

    category: async (parent, _args, context: GraphQLContext) => {
      if (parent.category && typeof parent.category === "object") {
        return parent.category;
      }
      return Category.findById(parent.category);
    },

    tags: async (parent, _args, context: GraphQLContext) => {
      if (parent.tags && Array.isArray(parent.tags)) {
        return parent.tags;
      }
      return Tag.find({ _id: { $in: parent.tags } });
    },

    chapters: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },

    reviews: async (parent, _args, context: GraphQLContext) => {
      // This would be populated when requested
      return [];
    },
  },
};
