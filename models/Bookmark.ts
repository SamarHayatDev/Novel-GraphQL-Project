import mongoose, { Document, Schema } from "mongoose";

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  novel: mongoose.Types.ObjectId;
  chapter: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    novel: {
      type: Schema.Types.ObjectId,
      ref: "Novel",
      required: [true, "Novel is required"],
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: [true, "Chapter is required"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note cannot exceed 200 characters"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for bookmark URL
bookmarkSchema.virtual("url").get(function (this: IBookmark) {
  return `/users/${this.user}/bookmarks/${this.chapter}`;
});

// Indexes for better query performance
bookmarkSchema.index({ user: 1, novel: 1, chapter: 1 }, { unique: true }); // One bookmark per user per chapter
bookmarkSchema.index({ user: 1, createdAt: -1 });
bookmarkSchema.index({ novel: 1 });
bookmarkSchema.index({ chapter: 1 });

// Static method to find user's bookmarks
bookmarkSchema.statics.findByUser = function (userId: string) {
  return this.find({ user: userId })
    .populate({
      path: "novel",
      select: "title titleUrdu coverImage author",
      populate: { path: "author", select: "name avatar" },
    })
    .populate({
      path: "chapter",
      select: "title titleUrdu chapterNumber wordCount readingTime",
    })
    .sort({ createdAt: -1 });
};

// Static method to find user's bookmarks by novel
bookmarkSchema.statics.findByUserAndNovel = function (
  userId: string,
  novelId: string
) {
  return this.find({ user: userId, novel: novelId })
    .populate({
      path: "chapter",
      select: "title titleUrdu chapterNumber wordCount readingTime",
    })
    .sort({ createdAt: -1 });
};

// Static method to check if user has bookmarked a chapter
bookmarkSchema.statics.isBookmarked = function (
  userId: string,
  chapterId: string
) {
  return this.exists({ user: userId, chapter: chapterId });
};

// Static method to get bookmark count for a chapter
bookmarkSchema.statics.getBookmarkCount = function (chapterId: string) {
  return this.countDocuments({ chapter: chapterId });
};

export const Bookmark = mongoose.models.Bookmark || mongoose.model<IBookmark>("Bookmark", bookmarkSchema);
