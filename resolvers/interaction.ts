import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Favorite, Bookmark, ReadingProgress, Novel, Chapter, User } from "../models";
import { requireAuth } from "../lib/context";
import { ValidationError, NotFoundError } from "../lib/errors";
import { applyPagination, validateObjectId } from "../lib/utils";

export const interactionResolvers: GraphQLResolvers = {
  Query: {
    // Get user's favorites
    myFavorites: async (_parent: any, { pagination }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      
      const query = Favorite.findByUser(user._id.toString());
      return applyPagination(query, pagination);
    },

    // Get user's bookmarks
    myBookmarks: async (_parent: any, { pagination }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      
      const query = Bookmark.findByUser(user._id.toString());
      return applyPagination(query, pagination);
    },

    // Get user's reading progress
    myReadingProgress: async (_parent: any, _args: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      
      return ReadingProgress.findByUser(user._id.toString());
    },

    // Get user's current reading
    myCurrentReading: async (_parent: any, _args: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      
      return ReadingProgress.findCurrentReading(user._id.toString());
    },

    // Get user's completed novels
    myCompletedNovels: async (_parent: any, _args: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      
      return ReadingProgress.findCompleted(user._id.toString());
    },

    // Check if user has favorited a novel
    isFavorited: async (_parent: any, { novelId }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(novelId, "Novel ID");
      
      return Favorite.isFavorited(user._id.toString(), novelId);
    },

    // Check if user has bookmarked a chapter
    isBookmarked: async (_parent: any, { chapterId }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(chapterId, "Chapter ID");
      
      return Bookmark.isBookmarked(user._id.toString(), chapterId);
    },
  },

  Mutation: {
    // Toggle favorite
    toggleFavorite: async (_parent: any, { novelId }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(novelId, "Novel ID");

      // Check if novel exists
      const novel = await Novel.findById(novelId);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      // Check if already favorited
      const existingFavorite = await Favorite.findOne({
        user: user._id,
        novel: novelId,
      });

      if (existingFavorite) {
        // Remove favorite
        await Favorite.findByIdAndDelete(existingFavorite._id);
        await novel.decrementFavorites();
        return false;
      } else {
        // Add favorite
        const favorite = new Favorite({
          user: user._id,
          novel: novelId,
        });
        await favorite.save();
        await novel.incrementFavorites();
        return true;
      }
    },

    // Add bookmark
    addBookmark: async (_parent: any, { input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(input.novelId, "Novel ID");
      validateObjectId(input.chapterId, "Chapter ID");

      // Check if novel and chapter exist
      const novel = await Novel.findById(input.novelId);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      const chapter = await Chapter.findById(input.chapterId);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      // Check if chapter belongs to novel
      if (chapter.novel.toString() !== input.novelId) {
        throw new ValidationError("Chapter does not belong to the specified novel");
      }

      // Check if already bookmarked
      const existingBookmark = await Bookmark.findOne({
        user: user._id,
        chapter: input.chapterId,
      });

      if (existingBookmark) {
        throw new ValidationError("Chapter is already bookmarked");
      }

      // Create bookmark
      const bookmark = new Bookmark({
        user: user._id,
        novel: input.novelId,
        chapter: input.chapterId,
        note: input.note?.trim(),
      });

      await bookmark.save();
      await chapter.incrementBookmarks();

      return bookmark.populate([
        { path: "novel", select: "title titleUrdu coverImage author" },
        { path: "chapter", select: "title titleUrdu chapterNumber wordCount readingTime" },
      ]);
    },

    // Remove bookmark
    removeBookmark: async (_parent: any, { chapterId }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(chapterId, "Chapter ID");

      const bookmark = await Bookmark.findOne({
        user: user._id,
        chapter: chapterId,
      });

      if (!bookmark) {
        throw new NotFoundError("Bookmark not found");
      }

      await Bookmark.findByIdAndDelete(bookmark._id);

      // Decrement chapter bookmark count
      const chapter = await Chapter.findById(chapterId);
      if (chapter) {
        await chapter.decrementBookmarks();
      }

      return true;
    },

    // Update reading progress
    updateReadingProgress: async (_parent: any, { input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      validateObjectId(input.novelId, "Novel ID");
      validateObjectId(input.chapterId, "Chapter ID");

      // Check if novel and chapter exist
      const novel = await Novel.findById(input.novelId);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      const chapter = await Chapter.findById(input.chapterId);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      // Check if chapter belongs to novel
      if (chapter.novel.toString() !== input.novelId) {
        throw new ValidationError("Chapter does not belong to the specified novel");
      }

      // Update or create reading progress
      const progress = await ReadingProgress.getOrCreate(
        user._id.toString(),
        input.novelId,
        input.chapterId
      );

      // Increment chapter views
      await chapter.incrementViews();

      return progress.populate([
        { path: "novel", select: "title titleUrdu coverImage author totalChapters publishedChapters status" },
        { path: "currentChapter", select: "title titleUrdu chapterNumber" },
      ]);
    },
  },

  Favorite: {
    // Resolve favorite relationships
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
  },

  Bookmark: {
    // Resolve bookmark relationships
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

    chapter: async (parent: any, _args: any, context: GraphQLContext) => {
      if (parent.chapter && typeof parent.chapter === "object") {
        return parent.chapter;
      }
      return Chapter.findById(parent.chapter);
    },
  },

  ReadingProgress: {
    // Resolve reading progress relationships
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

    currentChapter: async (parent: any, _args: any, context: GraphQLContext) => {
      if (parent.currentChapter && typeof parent.currentChapter === "object") {
        return parent.currentChapter;
      }
      return Chapter.findById(parent.currentChapter);
    },
  },
};
