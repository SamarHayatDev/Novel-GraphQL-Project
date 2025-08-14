import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  icon?: string; // base64 or icon name
  color?: string; // hex color for UI
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    icon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "#3B82F6", // Default blue color
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

// Virtual for category's novels (will be populated)
categorySchema.virtual("novels", {
  ref: "Novel",
  localField: "_id",
  foreignField: "category",
  justOne: false,
});

// Virtual for category's URL
categorySchema.virtual("url").get(function (this: ICategory) {
  return `/categories/${this.slug}`;
});

// Indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

// Static method to find active categories
categorySchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate("novels");
};

// Static method to find category by slug
categorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
