import { gql } from "graphql-tag";

// User Types
export const userTypes = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    avatar: String
    bio: String
    isEmailVerified: Boolean!
    lastLogin: Date
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    profileUrl: String!

    # Relationships (populated when requested)
    reviews: [Review!]
    favorites: [Novel!]
    bookmarks: [Bookmark!]
    readingProgress: [ReadingProgress!]
  }

  type UserConnection {
    data: [User!]!
    pagination: PaginationInfo!
  }

  type AuthResponse {
    user: User!
    token: String!
    refreshToken: String!
  }
`;

// Author Types
export const authorTypes = gql`
  type Author {
    id: ID!
    name: String!
    bio: String!
    avatar: String
    website: String
    socialLinks: SocialLinks
    birthDate: Date
    nationality: String
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    profileUrl: String!

    # Relationships
    novels: [Novel!]
  }

  type SocialLinks {
    twitter: String
    facebook: String
    instagram: String
    website: String
  }

  type AuthorConnection {
    data: [Author!]!
    pagination: PaginationInfo!
  }
`;

// Category Types
export const categoryTypes = gql`
  type Category {
    id: ID!
    name: String!
    description: String!
    slug: String!
    icon: String
    color: String!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    url: String!

    # Relationships
    novels: [Novel!]
  }

  type CategoryConnection {
    data: [Category!]!
    pagination: PaginationInfo!
  }
`;

// Tag Types
export const tagTypes = gql`
  type Tag {
    id: ID!
    name: String!
    description: String
    slug: String!
    color: String!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    url: String!

    # Relationships
    novels: [Novel!]
  }

  type TagConnection {
    data: [Tag!]!
    pagination: PaginationInfo!
  }
`;

// Novel Types
export const novelTypes = gql`
  type Novel {
    id: ID!
    title: String!
    titleUrdu: String
    description: String!
    descriptionUrdu: String
    coverImage: String
    status: NovelStatus!
    language: NovelLanguage!
    totalChapters: Int!
    publishedChapters: Int!
    averageRating: Float!
    totalRatings: Int!
    totalViews: Int!
    totalFavorites: Int!
    isPublished: Boolean!
    publishedAt: Date
    lastUpdated: Date!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    url: String!
    slug: String!
    completionPercentage: Int!

    # Relationships
    author: Author!
    category: Category!
    tags: [Tag!]
    chapters: [Chapter!]
    reviews: [Review!]
  }

  type NovelConnection {
    data: [Novel!]!
    pagination: PaginationInfo!
  }
`;

// Chapter Types
export const chapterTypes = gql`
  type Chapter {
    id: ID!
    title: String!
    titleUrdu: String
    content: String!
    contentUrdu: String
    chapterNumber: Int!
    wordCount: Int!
    readingTime: Int!
    isPublished: Boolean!
    publishedAt: Date
    totalViews: Int!
    totalBookmarks: Int!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    url: String!

    # Relationships
    novel: Novel!
    nextChapter: Chapter
    previousChapter: Chapter
  }

  type ChapterConnection {
    data: [Chapter!]!
    pagination: PaginationInfo!
  }
`;

// Review Types
export const reviewTypes = gql`
  type Review {
    id: ID!
    rating: Int!
    title: String
    comment: String
    isModerated: Boolean!
    isApproved: Boolean!
    moderatedBy: User
    moderatedAt: Date
    moderationReason: String
    helpfulVotes: Int!
    totalVotes: Int!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    url: String!
    helpfulPercentage: Int!

    # Relationships
    user: User!
    novel: Novel!
  }

  type ReviewConnection {
    data: [Review!]!
    pagination: PaginationInfo!
  }
`;

// User Interaction Types
export const interactionTypes = gql`
  type Favorite {
    id: ID!
    user: User!
    novel: Novel!
    createdAt: Date!

    # Computed fields
    url: String!
  }

  type Bookmark {
    id: ID!
    user: User!
    novel: Novel!
    chapter: Chapter!
    note: String
    createdAt: Date!

    # Computed fields
    url: String!
  }

  type BookmarkConnection {
    data: [Bookmark!]!
    pagination: PaginationInfo!
  }

  type ReadingProgress {
    id: ID!
    user: User!
    novel: Novel!
    currentChapter: Chapter!
    lastReadAt: Date!
    isCompleted: Boolean!
    completedAt: Date
    totalChaptersRead: Int!
    createdAt: Date!
    updatedAt: Date!

    # Computed fields
    url: String!
    progressPercentage: Int!
  }
`;

// Common Types
export const commonTypes = gql`
  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  type UserStats {
    totalUsers: Int!
    activeUsers: Int!
    newUsersThisMonth: Int!
    verifiedUsers: Int!
  }

  type NovelStats {
    totalNovels: Int!
    publishedNovels: Int!
    totalChapters: Int!
    totalViews: Int!
    totalFavorites: Int!
  }

  type UploadResult {
    success: Boolean!
    filename: String!
    originalName: String!
    mimetype: String!
    size: Int!
    width: Int!
    height: Int!
    url: String!
    thumbnailUrl: String
  }
`;

// All types combined
export const types = gql`
  ${userTypes}
  ${authorTypes}
  ${categoryTypes}
  ${tagTypes}
  ${novelTypes}
  ${chapterTypes}
  ${reviewTypes}
  ${interactionTypes}
  ${commonTypes}
`;
