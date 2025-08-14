import mongoose from "mongoose";
import { ValidationError } from "./errors";

// Pagination Interface
export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Create pagination options
export const createPaginationOptions = (input: PaginationInput) => {
  const page = Math.max(1, input.page || 1);
  const limit = Math.min(100, Math.max(1, input.limit || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Apply pagination to mongoose query
export const applyPagination = async <T>(
  query: mongoose.Query<T[], T>,
  paginationInput: PaginationInput
): Promise<PaginationResult<T>> => {
  const { page, limit, skip } = createPaginationOptions(paginationInput);

  // Clone the query for counting (without populate)
  const countQuery = query.model.find(query.getQuery());

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    countQuery.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// Search and Filter Interface
export interface SearchFilterInput {
  search?: string;
  category?: string;
  author?: string;
  tags?: string[];
  status?: string;
  language?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Create search filter for novels
export const createNovelFilter = (filter: SearchFilterInput) => {
  const queryFilter: any = {};

  if (filter.search) {
    queryFilter.$or = [
      { title: { $regex: filter.search, $options: "i" } },
      { titleUrdu: { $regex: filter.search, $options: "i" } },
      { description: { $regex: filter.search, $options: "i" } },
      { descriptionUrdu: { $regex: filter.search, $options: "i" } },
    ];
  }

  if (filter.categoryId) {
    queryFilter.category = new mongoose.Types.ObjectId(filter.categoryId);
  }

  if (filter.authorId) {
    queryFilter.author = new mongoose.Types.ObjectId(filter.authorId);
  }

  if (filter.tagIds && filter.tagIds.length > 0) {
    queryFilter.tags = {
      $in: filter.tagIds.map((tag) => new mongoose.Types.ObjectId(tag)),
    };
  }

  if (filter.status) {
    queryFilter.status = filter.status.toLowerCase();
  }

  if (filter.language) {
    queryFilter.language = filter.language;
  }

  return queryFilter;
};

// Create sort options
export const createSortOptions = (
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc"
) => {
  const order = sortOrder === "asc" ? 1 : -1;

  switch (sortBy) {
    case "title":
      return { title: order };
    case "rating":
      return { averageRating: order };
    case "views":
      return { totalViews: order };
    case "favorites":
      return { totalFavorites: order };
    case "updated":
      return { lastUpdated: order };
    case "published":
      return { publishedAt: order };
    default:
      return { createdAt: order };
  }
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Validate and convert base64 image
export const validateBase64Image = (base64: string): boolean => {
  // Check if it's a valid base64 image
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(base64);
};

// Compress base64 image (basic implementation)
export const compressBase64Image = async (
  base64: string,
  maxSize: number = 800
): Promise<string> => {
  // This is a placeholder - in production, use a proper image compression library
  // For now, we'll just validate and return the original
  if (!validateBase64Image(base64)) {
    throw new Error("Invalid base64 image format");
  }
  return base64;
};

// Calculate reading time
export const calculateReadingTime = (
  text: string,
  wordsPerMinute: number = 200
): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format relative time
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Generate random string
export const generateRandomString = (length: number = 8): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// Validate ObjectId
export const validateObjectId = (
  id: string,
  fieldName: string = "ID"
): void => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
};
