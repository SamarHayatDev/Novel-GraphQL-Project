import mongoose, { Document, Schema } from "mongoose";

export interface IReadingProgress extends Document {
  user: mongoose.Types.ObjectId;
  novel: mongoose.Types.ObjectId;
  currentChapter: mongoose.Types.ObjectId;
  lastReadAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
  totalChaptersRead: number;
  createdAt: Date;
  updatedAt: Date;
}

const readingProgressSchema = new Schema<IReadingProgress>(
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
    currentChapter: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: [true, "Current chapter is required"],
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    totalChaptersRead: {
      type: Number,
      default: 0,
      min: [0, "Total chapters read cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress percentage
readingProgressSchema
  .virtual("progressPercentage")
  .get(function (this: IReadingProgress) {
    // This will be calculated when populated with novel data
    return 0;
  });

// Virtual for progress URL
readingProgressSchema.virtual("url").get(function (this: IReadingProgress) {
  return `/users/${this.user}/progress/${this.novel}`;
});

// Indexes for better query performance
readingProgressSchema.index({ user: 1, novel: 1 }, { unique: true }); // One progress per user per novel
readingProgressSchema.index({ user: 1, lastReadAt: -1 });
readingProgressSchema.index({ user: 1, isCompleted: 1 });
readingProgressSchema.index({ novel: 1 });

// Compound indexes for common queries
readingProgressSchema.index({ user: 1, isCompleted: 1, lastReadAt: -1 });

// Static method to find user's reading progress
readingProgressSchema.statics.findByUser = function (userId: string) {
  return this.find({ user: userId })
    .populate({
      path: "novel",
      select:
        "title titleUrdu coverImage author totalChapters publishedChapters status",
      populate: { path: "author", select: "name avatar" },
    })
    .populate({
      path: "currentChapter",
      select: "title titleUrdu chapterNumber",
    })
    .sort({ lastReadAt: -1 });
};

// Static method to find user's current reading (not completed)
readingProgressSchema.statics.findCurrentReading = function (userId: string) {
  return this.find({ user: userId, isCompleted: false })
    .populate({
      path: "novel",
      select:
        "title titleUrdu coverImage author totalChapters publishedChapters status",
      populate: { path: "author", select: "name avatar" },
    })
    .populate({
      path: "currentChapter",
      select: "title titleUrdu chapterNumber",
    })
    .sort({ lastReadAt: -1 });
};

// Static method to find user's completed novels
readingProgressSchema.statics.findCompleted = function (userId: string) {
  return this.find({ user: userId, isCompleted: true })
    .populate({
      path: "novel",
      select:
        "title titleUrdu coverImage author totalChapters publishedChapters status",
      populate: { path: "author", select: "name avatar" },
    })
    .sort({ completedAt: -1 });
};

// Static method to get or create reading progress
readingProgressSchema.statics.getOrCreate = async function (
  userId: string,
  novelId: string,
  chapterId: string
) {
  let progress = await this.findOne({ user: userId, novel: novelId });

  if (!progress) {
    progress = new this({
      user: userId,
      novel: novelId,
      currentChapter: chapterId,
      totalChaptersRead: 1,
    });
  } else {
    progress.currentChapter = chapterId;
    progress.lastReadAt = new Date();
    if (!progress.isCompleted) {
      progress.totalChaptersRead += 1;
    }
  }

  return progress.save();
};

// Method to mark novel as completed
readingProgressSchema.methods.markCompleted = async function () {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to update progress
readingProgressSchema.methods.updateProgress = async function (
  chapterId: string
) {
  this.currentChapter = chapterId;
  this.lastReadAt = new Date();
  if (!this.isCompleted) {
    this.totalChaptersRead += 1;
  }
  return this.save();
};

export const ReadingProgress = mongoose.models.ReadingProgress || mongoose.model<IReadingProgress>(
  "ReadingProgress",
  readingProgressSchema
);
