import { gql } from "graphql-tag";

// Enums
export const enums = gql`
  enum UserRole {
    ADMIN
    READER
    AUTHOR
  }

  enum NovelStatus {
    ONGOING
    COMPLETED
    HIATUS
    CANCELLED
  }

  enum NovelLanguage {
    ENGLISH
    URDU
    BILINGUAL
  }

  enum NovelSortBy {
    TITLE
    RATING
    VIEWS
    FAVORITES
    UPDATED
    PUBLISHED
    CREATED
  }

  enum SortOrder {
    ASC
    DESC
  }
`;

// Input Types
export const inputTypes = gql`
  # Pagination
  input PaginationInput {
    page: Int
    limit: Int
  }

  # Authentication inputs
  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: UserRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    bio: String
    avatar: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input ResetPasswordInput {
    token: String!
    newPassword: String!
  }

  # Author inputs
  input CreateAuthorInput {
    name: String!
    bio: String!
    avatar: String
    website: String
    socialLinks: SocialLinksInput
    birthDate: Date
    nationality: String
  }

  input UpdateAuthorInput {
    name: String
    bio: String
    avatar: String
    website: String
    socialLinks: SocialLinksInput
    birthDate: Date
    nationality: String
    isActive: Boolean
  }

  input SocialLinksInput {
    twitter: String
    facebook: String
    instagram: String
    website: String
  }

  # Category inputs
  input CreateCategoryInput {
    name: String!
    description: String!
    slug: String!
    icon: String
    color: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
    slug: String
    icon: String
    color: String
    isActive: Boolean
  }

  # Tag inputs
  input CreateTagInput {
    name: String!
    description: String
    slug: String!
    color: String
  }

  input UpdateTagInput {
    name: String
    description: String
    slug: String
    color: String
    isActive: Boolean
  }

  # Novel inputs
  input CreateNovelInput {
    title: String!
    titleUrdu: String
    description: String!
    descriptionUrdu: String
    authorId: ID!
    categoryId: ID!
    tagIds: [ID!]
    coverImage: String
    status: NovelStatus
    language: NovelLanguage
    totalChapters: Int
  }

  input UpdateNovelInput {
    title: String
    titleUrdu: String
    description: String
    descriptionUrdu: String
    authorId: ID
    categoryId: ID
    tagIds: [ID!]
    coverImage: String
    status: NovelStatus
    language: NovelLanguage
    totalChapters: Int
  }

  input NovelFilterInput {
    search: String
    categoryId: ID
    authorId: ID
    tagIds: [ID!]
    status: NovelStatus
    language: NovelLanguage
  }

  # Chapter inputs
  input CreateChapterInput {
    novelId: ID!
    title: String!
    titleUrdu: String
    content: String!
    contentUrdu: String
    chapterNumber: Int!
  }

  input UpdateChapterInput {
    title: String
    titleUrdu: String
    content: String
    contentUrdu: String
    chapterNumber: Int
  }

  # Review inputs
  input CreateReviewInput {
    novelId: ID!
    rating: Int!
    title: String
    comment: String
  }

  input UpdateReviewInput {
    rating: Int
    title: String
    comment: String
  }

  input ModerateReviewInput {
    isApproved: Boolean!
    reason: String
  }

  # User interaction inputs
  input AddBookmarkInput {
    novelId: ID!
    chapterId: ID!
    note: String
  }

  input UpdateReadingProgressInput {
    novelId: ID!
    chapterId: ID!
  }

  # Upload inputs
  input UploadImageInput {
    base64Data: String!
    type: UploadType!
    folder: String
  }

  enum UploadType {
    AVATAR
    COVER
    CHAPTER
  }
`;

// All inputs combined
export const inputs = gql`
  ${enums}
  ${inputTypes}
`;
