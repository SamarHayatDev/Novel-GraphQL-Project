import mongoose, { Document, Schema } from "mongoose";

export interface INovel extends Document {
  title: string;
  titleUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  coverImage?: string; // base64 image
  status: "ongoing" | "completed" | "hiatus" | "cancelled";
  language: "english" | "urdu" | "bilingual";
  totalChapters: number;
  publishedChapters: number;
  averageRating: number;
  totalRatings: number;
  totalViews: number;
  totalFavorites: number;
  isPublished: boolean;
  publishedAt?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const novelSchema = new Schema<INovel>(
  {
    title: {
      type: String,
      required: [true, "Novel title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    titleUrdu: {
      type: String,
      trim: true,
      maxlength: [200, "Urdu title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Novel description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    descriptionUrdu: {
      type: String,
      maxlength: [2000, "Urdu description cannot exceed 2000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: [true, "Author is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: "Tag",
    }],
    coverImage: {
      type: String, // base64 encoded image
      default: null,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "hiatus", "cancelled"],
      default: "ongoing",
    },
    language: {
      type: String,
      enum: ["english", "urdu", "bilingual"],
      default: "english",
    },
    totalChapters: {
      type: Number,
      default: 0,
      min: [0, "Total chapters cannot be negative"],
    },
    publishedChapters: {
      type: Number,
      default: 0,
      min: [0, "Published chapters cannot be negative"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be negative"],
      max: [5, "Average rating cannot exceed 5"],
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: [0, "Total ratings cannot be negative"],
    },
    totalViews: {
      type: Number,
      default: 0,
      min: [0, "Total views cannot be negative"],
    },
    totalFavorites: {
      type: Number,
      default: 0,
      min: [0, "Total favorites cannot be negative"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for novel's chapters (will be populated)
novelSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "novel",
  justOne: false,
});

// Virtual for novel's reviews (will be populated)
novelSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "novel",
  justOne: false,
});

// Virtual for novel's URL
novelSchema.virtual("url").get(function (this: INovel) {
  return `/novels/${this._id}`;
});

// Virtual for novel's slug (for SEO-friendly URLs)
novelSchema.virtual("slug").get(function (this: INovel) {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
});

// Virtual for completion percentage
novelSchema.virtual("completionPercentage").get(function (this: INovel) {
  if (this.totalChapters === 0) return 0;
  return Math.round((this.publishedChapters / this.totalChapters) * 100);
});

// Indexes for better query performance
novelSchema.index({ title: 1 });
novelSchema.index({ author: 1 });
novelSchema.index({ category: 1 });
novelSchema.index({ tags: 1 });
novelSchema.index({ status: 1 });
novelSchema.index({ language: 1 });
novelSchema.index({ isPublished: 1 });
novelSchema.index({ averageRating: -1 });
novelSchema.index({ totalViews: -1 });
novelSchema.index({ totalFavorites: -1 });
novelSchema.index({ lastUpdated: -1 });
novelSchema.index({ publishedAt: -1 });

// Compound indexes for common queries
novelSchema.index({ category: 1, isPublished: 1 });
novelSchema.index({ author: 1, isPublished: 1 });
novelSchema.index({ status: 1, isPublished: 1 });

// Static method to find published novels
novelSchema.statics.findPublished = function () {
  return this.find({ isPublished: true })
    .populate("author", "name avatar")
    .populate("category", "name slug")
    .populate("tags", "name slug color");
};

// Static method to find novels by author
novelSchema.statics.findByAuthor = function (authorId: string) {
  return this.find({ author: authorId, isPublished: true })
    .populate("category", "name slug")
    .populate("tags", "name slug color");
};

// Static method to find novels by category
novelSchema.statics.findByCategory = function (categoryId: string) {
  return this.find({ category: categoryId, isPublished: true })
    .populate("author", "name avatar")
    .populate("tags", "name slug color");
};

// Static method to search novels
novelSchema.statics.search = function (searchTerm: string) {
  return this.find({
    $and: [
      { isPublished: true },
      {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { titleUrdu: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
          { descriptionUrdu: { $regex: searchTerm, $options: "i" } },
        ],
      },
    ],
  })
    .populate("author", "name avatar")
    .populate("category", "name slug")
    .populate("tags", "name slug color");
};

// Method to update rating
novelSchema.methods.updateRating = async function (newRating: number) {
  const currentTotal = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (currentTotal + newRating) / this.totalRatings;
  return this.save();
};

// Method to increment views
novelSchema.methods.incrementViews = async function () {
  this.totalViews += 1;
  return this.save();
};

// Method to increment favorites
novelSchema.methods.incrementFavorites = async function () {
  this.totalFavorites += 1;
  return this.save();
};

// Method to decrement favorites
novelSchema.methods.decrementFavorites = async function () {
  if (this.totalFavorites > 0) {
    this.totalFavorites -= 1;
  }
  return this.save();
};

export const Novel = mongoose.models.Novel || mongoose.model<INovel>("Novel", novelSchema);
