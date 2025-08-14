import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  novel: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for favorite URL
favoriteSchema.virtual("url").get(function (this: IFavorite) {
  return `/users/${this.user}/favorites/${this.novel}`;
});

// Indexes for better query performance
favoriteSchema.index({ user: 1, novel: 1 }, { unique: true }); // One favorite per user per novel
favoriteSchema.index({ user: 1, createdAt: -1 });
favoriteSchema.index({ novel: 1 });

// Static method to find user's favorites
favoriteSchema.statics.findByUser = function (userId: string) {
  return this.find({ user: userId })
    .populate({
      path: "novel",
      select:
        "title titleUrdu coverImage author category averageRating totalViews status",
      populate: [
        { path: "author", select: "name avatar" },
        { path: "category", select: "name slug" },
      ],
    })
    .sort({ createdAt: -1 });
};

// Static method to check if user has favorited a novel
favoriteSchema.statics.isFavorited = function (
  userId: string,
  novelId: string
) {
  return this.exists({ user: userId, novel: novelId });
};

// Static method to get favorite count for a novel
favoriteSchema.statics.getFavoriteCount = function (novelId: string) {
  return this.countDocuments({ novel: novelId });
};

export const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", favoriteSchema);
