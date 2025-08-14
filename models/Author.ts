import mongoose, { Document, Schema } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  bio: string;
  avatar?: string; // base64 image
  website?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  birthDate?: Date;
  nationality?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      required: [true, "Author bio is required"],
      maxlength: [2000, "Bio cannot exceed 2000 characters"],
    },
    avatar: {
      type: String, // base64 encoded image
      default: null,
    },
    website: {
      type: String,
      match: [
        /^https?:\/\/.+/,
        "Please enter a valid website URL starting with http:// or https://",
      ],
    },
    socialLinks: {
      twitter: {
        type: String,
        match: [/^https?:\/\/twitter\.com\/.+/, "Please enter a valid Twitter URL"],
      },
      facebook: {
        type: String,
        match: [/^https?:\/\/facebook\.com\/.+/, "Please enter a valid Facebook URL"],
      },
      instagram: {
        type: String,
        match: [/^https?:\/\/instagram\.com\/.+/, "Please enter a valid Instagram URL"],
      },
      website: {
        type: String,
        match: [
          /^https?:\/\/.+/,
          "Please enter a valid website URL starting with http:// or https://",
        ],
      },
    },
    birthDate: Date,
    nationality: {
      type: String,
      maxlength: [50, "Nationality cannot exceed 50 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for author's novels (will be populated)
authorSchema.virtual("novels", {
  ref: "Novel",
  localField: "_id",
  foreignField: "author",
  justOne: false,
});

// Virtual for author's profile URL
authorSchema.virtual("profileUrl").get(function (this: IAuthor) {
  return `/authors/${this._id}`;
});

// Indexes for better query performance
authorSchema.index({ name: 1 });
authorSchema.index({ isActive: 1 });
authorSchema.index({ "socialLinks.twitter": 1 });

// Static method to find active authors
authorSchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate("novels");
};

// Static method to search authors by name
authorSchema.statics.searchByName = function (searchTerm: string) {
  return this.find({
    name: { $regex: searchTerm, $options: "i" },
    isActive: true,
  });
};

export const Author = mongoose.models.Author || mongoose.model<IAuthor>("Author", authorSchema);
