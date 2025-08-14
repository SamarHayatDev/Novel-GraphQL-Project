import { GraphQLResolvers } from "../types/graphql";
import { GraphQLContext } from "../lib/context";
import { Chapter, Novel } from "../models";
import { requireAnyRole } from "../lib/context";
import { ValidationError, NotFoundError } from "../lib/errors";
import { applyPagination, validateObjectId } from "../lib/utils";

export const chapterResolvers: GraphQLResolvers = {
  Query: {
    // Get chapter by ID
    chapter: async (_parent: any, { id }: any, context: GraphQLContext) => {
      validateObjectId(id, "Chapter ID");
      const chapter = await Chapter.findById(id)
        .populate("novel", "title titleUrdu author category");
      
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      return chapter;
    },

    // Get chapter by novel and chapter number
    chapterByNovelAndNumber: async (_parent: any, { novelId, chapterNumber }: any, context: GraphQLContext) => {
      validateObjectId(novelId, "Novel ID");
      
      if (!chapterNumber || chapterNumber < 1) {
        throw new ValidationError("Chapter number must be at least 1");
      }

      const chapter = await Chapter.findByNovelAndNumber(novelId, chapterNumber);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      return chapter;
    },

    // Get chapters by novel
    chaptersByNovel: async (_parent: any, { novelId, pagination }: any, context: GraphQLContext) => {
      validateObjectId(novelId, "Novel ID");
      
      const query = Chapter.findPublishedByNovel(novelId);
      return applyPagination(query, pagination);
    },
  },

  Mutation: {
    // Create chapter
    createChapter: async (_parent: any, { input }: any, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);

      // Validate required fields
      if (!input.title || input.title.trim().length < 2) {
        throw new ValidationError("Chapter title must be at least 2 characters");
      }

      if (!input.content || input.content.trim().length < 10) {
        throw new ValidationError("Chapter content must be at least 10 characters");
      }

      if (!input.chapterNumber || input.chapterNumber < 1) {
        throw new ValidationError("Chapter number must be at least 1");
      }

      // Validate novel reference
      validateObjectId(input.novelId, "Novel ID");
      const novel = await Novel.findById(input.novelId);
      if (!novel) {
        throw new NotFoundError("Novel not found");
      }

      // Check if chapter number already exists for this novel
      const existingChapter = await Chapter.findOne({
        novel: input.novelId,
        chapterNumber: input.chapterNumber,
      });

      if (existingChapter) {
        throw new ValidationError("Chapter number already exists for this novel");
      }

      // Create new chapter
      const chapter = new Chapter({
        novel: input.novelId,
        title: input.title.trim(),
        titleUrdu: input.titleUrdu?.trim(),
        content: input.content.trim(),
        contentUrdu: input.contentUrdu?.trim(),
        chapterNumber: input.chapterNumber,
      });

      await chapter.save();

      // Update novel's published chapters count
      novel.publishedChapters += 1;
      novel.lastUpdated = new Date();
      await novel.save();

      return chapter.populate("novel", "title titleUrdu author category");
    },

    // Update chapter
    updateChapter: async (_parent: any, { id, input }: any, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Chapter ID");

      const chapter = await Chapter.findById(id);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      // Update fields
      if (input.title !== undefined) {
        if (input.title.trim().length < 2) {
          throw new ValidationError("Chapter title must be at least 2 characters");
        }
        chapter.title = input.title.trim();
      }

      if (input.titleUrdu !== undefined) {
        chapter.titleUrdu = input.titleUrdu?.trim();
      }

      if (input.content !== undefined) {
        if (input.content.trim().length < 10) {
          throw new ValidationError("Chapter content must be at least 10 characters");
        }
        chapter.content = input.content.trim();
      }

      if (input.contentUrdu !== undefined) {
        chapter.contentUrdu = input.contentUrdu?.trim();
      }

      if (input.chapterNumber !== undefined) {
        if (input.chapterNumber < 1) {
          throw new ValidationError("Chapter number must be at least 1");
        }

        // Check if new chapter number already exists
        const existingChapter = await Chapter.findOne({
          novel: chapter.novel,
          chapterNumber: input.chapterNumber,
          _id: { $ne: id },
        });

        if (existingChapter) {
          throw new ValidationError("Chapter number already exists for this novel");
        }

        chapter.chapterNumber = input.chapterNumber;
      }

      await chapter.save();

      return chapter.populate("novel", "title titleUrdu author category");
    },

    // Delete chapter
    deleteChapter: async (_parent: any, { id }: any, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Chapter ID");

      const chapter = await Chapter.findById(id);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      await Chapter.findByIdAndDelete(id);

      // Update novel's published chapters count
      const novel = await Novel.findById(chapter.novel);
      if (novel && novel.publishedChapters > 0) {
        novel.publishedChapters -= 1;
        novel.lastUpdated = new Date();
        await novel.save();
      }

      return true;
    },

    // Publish chapter
    publishChapter: async (_parent: any, { id }: any, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Chapter ID");

      const chapter = await Chapter.findById(id);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      chapter.isPublished = true;
      chapter.publishedAt = new Date();
      await chapter.save();

      return chapter;
    },

    // Unpublish chapter
    unpublishChapter: async (_parent: any, { id }: any, context: GraphQLContext) => {
      requireAnyRole(context, ["admin", "author"]);
      validateObjectId(id, "Chapter ID");

      const chapter = await Chapter.findById(id);
      if (!chapter) {
        throw new NotFoundError("Chapter not found");
      }

      chapter.isPublished = false;
      chapter.publishedAt = undefined;
      await chapter.save();

      return chapter;
    },
  },

  Chapter: {
    // Resolve chapter relationships
    novel: async (parent: any, _args: any, context: GraphQLContext) => {
      if (parent.novel && typeof parent.novel === "object") {
        return parent.novel;
      }
      return Novel.findById(parent.novel);
    },

    nextChapter: async (parent: any, _args: any, context: GraphQLContext) => {
      return Chapter.findNextChapter(parent.novel.toString(), parent.chapterNumber);
    },

    previousChapter: async (parent: any, _args: any, context: GraphQLContext) => {
      return Chapter.findPreviousChapter(parent.novel.toString(), parent.chapterNumber);
    },
  },
};
