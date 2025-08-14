import mongoose, { Document, Schema } from "mongoose";

export interface IChapter extends Document {
  novel: mongoose.Types.ObjectId;
  title: string;
  titleUrdu?: string;
  content: string;
  contentUrdu?: string;
  chapterNumber: number;
  wordCount: number;
  readingTime: number; // estimated reading time in minutes
  isPublished: boolean;
  publishedAt?: Date;
  totalViews: number;
  totalBookmarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>(
  {
    novel: {
      type: Schema.Types.ObjectId,
      ref: "Novel",
      required: [true, "Novel is required"],
    },
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    titleUrdu: {
      type: String,
      trim: true,
      maxlength: [200, "Urdu title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Chapter content is required"],
      maxlength: [50000, "Content cannot exceed 50,000 characters"],
    },
    contentUrdu: {
      type: String,
      maxlength: [50000, "Urdu content cannot exceed 50,000 characters"],
    },
    chapterNumber: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: [1, "Chapter number must be at least 1"],
    },
    wordCount: {
      type: Number,
      default: 0,
      min: [0, "Word count cannot be negative"],
    },
    readingTime: {
      type: Number,
      default: 0,
      min: [0, "Reading time cannot be negative"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    totalViews: {
      type: Number,
      default: 0,
      min: [0, "Total views cannot be negative"],
    },
    totalBookmarks: {
      type: Number,
      default: 0,
      min: [0, "Total bookmarks cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for chapter's URL
chapterSchema.virtual("url").get(function (this: IChapter) {
  return `/novels/${this.novel}/chapters/${this.chapterNumber}`;
});

// Virtual for next chapter
chapterSchema.virtual("nextChapter", {
  ref: "Chapter",
  localField: "novel",
  foreignField: "novel",
  justOne: true,
  match: { chapterNumber: { $gt: "$$chapterNumber" } },
  options: { sort: { chapterNumber: 1 } },
});

// Virtual for previous chapter
chapterSchema.virtual("previousChapter", {
  ref: "Chapter",
  localField: "novel",
  foreignField: "novel",
  justOne: true,
  match: { chapterNumber: { $lt: "$$chapterNumber" } },
  options: { sort: { chapterNumber: -1 } },
});

// Indexes for better query performance
chapterSchema.index({ novel: 1, chapterNumber: 1 }, { unique: true });
chapterSchema.index({ novel: 1, isPublished: 1 });
chapterSchema.index({ isPublished: 1 });
chapterSchema.index({ publishedAt: -1 });
chapterSchema.index({ totalViews: -1 });
chapterSchema.index({ totalBookmarks: -1 });

// Compound indexes for common queries
chapterSchema.index({ novel: 1, isPublished: 1, chapterNumber: 1 });

// Pre-save middleware to calculate word count and reading time
chapterSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    // Calculate word count (simple whitespace-based calculation)
    this.wordCount = this.content.trim().split(/\s+/).length;

    // Estimate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

// Static method to find published chapters by novel
chapterSchema.statics.findPublishedByNovel = function (novelId: string) {
  return this.find({ novel: novelId, isPublished: true })
    .sort({ chapterNumber: 1 })
    .select(
      "title titleUrdu chapterNumber wordCount readingTime totalViews publishedAt"
    );
};

// Static method to find chapter by novel and chapter number
chapterSchema.statics.findByNovelAndNumber = function (
  novelId: string,
  chapterNumber: number
) {
  return this.findOne({
    novel: novelId,
    chapterNumber,
    isPublished: true,
  }).populate("novel", "title titleUrdu author category");
};

// Static method to find next chapter
chapterSchema.statics.findNextChapter = function (
  novelId: string,
  currentChapterNumber: number
) {
  return this.findOne({
    novel: novelId,
    chapterNumber: { $gt: currentChapterNumber },
    isPublished: true,
  }).sort({ chapterNumber: 1 });
};

// Static method to find previous chapter
chapterSchema.statics.findPreviousChapter = function (
  novelId: string,
  currentChapterNumber: number
) {
  return this.findOne({
    novel: novelId,
    chapterNumber: { $lt: currentChapterNumber },
    isPublished: true,
  }).sort({ chapterNumber: -1 });
};

// Method to increment views
chapterSchema.methods.incrementViews = async function () {
  this.totalViews += 1;
  return this.save();
};

// Method to increment bookmarks
chapterSchema.methods.incrementBookmarks = async function () {
  this.totalBookmarks += 1;
  return this.save();
};

// Method to decrement bookmarks
chapterSchema.methods.decrementBookmarks = async function () {
  if (this.totalBookmarks > 0) {
    this.totalBookmarks -= 1;
  }
  return this.save();
};

export const Chapter = mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", chapterSchema);
