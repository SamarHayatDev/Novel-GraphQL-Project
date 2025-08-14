import mongoose, { Document, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  description?: string;
  slug: string;
  color?: string; // hex color for UI
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      maxlength: [30, "Tag name cannot exceed 30 characters"],
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    slug: {
      type: String,
      required: [true, "Tag slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    color: {
      type: String,
      default: "#6B7280", // Default gray color
      match: [/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"],
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

// Virtual for tag's novels (will be populated)
tagSchema.virtual("novels", {
  ref: "Novel",
  localField: "_id",
  foreignField: "tags",
  justOne: false,
});

// Virtual for tag's URL
tagSchema.virtual("url").get(function (this: ITag) {
  return `/tags/${this.slug}`;
});

// Indexes for better query performance
tagSchema.index({ name: 1 });
tagSchema.index({ slug: 1 });
tagSchema.index({ isActive: 1 });

// Static method to find active tags
tagSchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate("novels");
};

// Static method to find tag by slug
tagSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

// Static method to search tags by name
tagSchema.statics.searchByName = function (searchTerm: string) {
  return this.find({
    name: { $regex: searchTerm, $options: "i" },
    isActive: true,
  });
};

export const Tag = mongoose.models.Tag || mongoose.model<ITag>("Tag", tagSchema);
