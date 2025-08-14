import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  novel: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  isModerated: boolean;
  isApproved: boolean;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationReason?: string;
  helpfulVotes: number;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
    moderationReason: {
      type: String,
      maxlength: [500, "Moderation reason cannot exceed 500 characters"],
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: [0, "Helpful votes cannot be negative"],
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: [0, "Total votes cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for helpful percentage
reviewSchema.virtual("helpfulPercentage").get(function (this: IReview) {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Virtual for review URL
reviewSchema.virtual("url").get(function (this: IReview) {
  return `/novels/${this.novel}/reviews/${this._id}`;
});

// Indexes for better query performance
reviewSchema.index({ novel: 1, createdAt: -1 });
reviewSchema.index({ user: 1, novel: 1 }, { unique: true }); // One review per user per novel
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isModerated: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ helpfulVotes: -1 });

// Compound indexes for common queries
reviewSchema.index({ novel: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ novel: 1, rating: 1 });

// Pre-save middleware to update novel rating
reviewSchema.pre("save", async function (next) {
  if (this.isModified("rating") || this.isNew) {
    try {
      const Novel = mongoose.model("Novel");
      const novel = await Novel.findById(this.novel);
      if (novel) {
        await novel.updateRating(this.rating);
      }
    } catch (error) {
      console.error("Error updating novel rating:", error);
    }
  }
  next();
});

// Static method to find approved reviews by novel
reviewSchema.statics.findApprovedByNovel = function (novelId: string) {
  return this.find({ novel: novelId, isApproved: true })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
};

// Static method to find reviews by user
reviewSchema.statics.findByUser = function (userId: string) {
  return this.find({ user: userId })
    .populate("novel", "title coverImage")
    .sort({ createdAt: -1 });
};

// Static method to find reviews needing moderation
reviewSchema.statics.findNeedingModeration = function () {
  return this.find({ isModerated: false })
    .populate("user", "name email")
    .populate("novel", "title")
    .sort({ createdAt: -1 });
};

// Method to vote on review helpfulness
reviewSchema.methods.voteHelpful = async function (isHelpful: boolean) {
  this.totalVotes += 1;
  if (isHelpful) {
    this.helpfulVotes += 1;
  }
  return this.save();
};

// Method to moderate review
reviewSchema.methods.moderate = async function (
  isApproved: boolean,
  moderatorId: string,
  reason?: string
) {
  this.isModerated = true;
  this.isApproved = isApproved;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  if (reason) {
    this.moderationReason = reason;
  }
  return this.save();
};

export const Review = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
