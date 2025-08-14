import { gql } from "graphql-tag";
import { types } from "./types";
import { inputs } from "./inputs";

// Main Schema
export const schema = gql`
  scalar Date
  scalar Upload

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(pagination: PaginationInput): UserConnection!

    # Author queries
    author(id: ID!): Author
    authors(pagination: PaginationInput): AuthorConnection!
    searchAuthors(search: String!): [Author!]!

    # Category queries
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    categories(pagination: PaginationInput): CategoryConnection!

    # Tag queries
    tag(id: ID!): Tag
    tagBySlug(slug: String!): Tag
    tags(pagination: PaginationInput): TagConnection!
    searchTags(search: String!): [Tag!]!

    # Novel queries
    novel(id: ID!): Novel
    novels(
      filter: NovelFilterInput
      pagination: PaginationInput
      sortBy: NovelSortBy
      sortOrder: SortOrder
    ): NovelConnection!
    searchNovels(search: String!): [Novel!]!
    novelsByAuthor(authorId: ID!, pagination: PaginationInput): NovelConnection!
    novelsByCategory(
      categoryId: ID!
      pagination: PaginationInput
    ): NovelConnection!
    novelsByTag(tagId: ID!, pagination: PaginationInput): NovelConnection!

    # Chapter queries
    chapter(id: ID!): Chapter
    chapterByNovelAndNumber(novelId: ID!, chapterNumber: Int!): Chapter
    chaptersByNovel(
      novelId: ID!
      pagination: PaginationInput
    ): ChapterConnection!

    # Review queries
    review(id: ID!): Review
    reviewsByNovel(novelId: ID!, pagination: PaginationInput): ReviewConnection!
    reviewsByUser(userId: ID!, pagination: PaginationInput): ReviewConnection!

    # User interaction queries
    myFavorites(pagination: PaginationInput): NovelConnection!
    myBookmarks(pagination: PaginationInput): BookmarkConnection!
    myReadingProgress: [ReadingProgress!]!
    myCurrentReading: [ReadingProgress!]!
    myCompletedNovels: [ReadingProgress!]!

    # Check if user has interacted with content
    isFavorited(novelId: ID!): Boolean!
    isBookmarked(chapterId: ID!): Boolean!

    # Admin queries
    pendingReviews(pagination: PaginationInput): ReviewConnection!
    userStats: UserStats!
    novelStats: NovelStats!
  }

  type Mutation {
    # Authentication mutations
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    refreshToken: AuthResponse!
    logout: Boolean!

    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!
    verifyEmail(token: String!): Boolean!
    requestEmailVerification: Boolean!

    # Author mutations (admin only)
    createAuthor(input: CreateAuthorInput!): Author!
    updateAuthor(id: ID!, input: UpdateAuthorInput!): Author!
    deleteAuthor(id: ID!): Boolean!

    # Category mutations (admin only)
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Tag mutations (admin only)
    createTag(input: CreateTagInput!): Tag!
    updateTag(id: ID!, input: UpdateTagInput!): Tag!
    deleteTag(id: ID!): Boolean!

    # Novel mutations
    createNovel(input: CreateNovelInput!): Novel!
    updateNovel(id: ID!, input: UpdateNovelInput!): Novel!
    deleteNovel(id: ID!): Boolean!
    publishNovel(id: ID!): Novel!
    unpublishNovel(id: ID!): Novel!

    # Chapter mutations
    createChapter(input: CreateChapterInput!): Chapter!
    updateChapter(id: ID!, input: UpdateChapterInput!): Chapter!
    deleteChapter(id: ID!): Boolean!
    publishChapter(id: ID!): Chapter!
    unpublishChapter(id: ID!): Chapter!

    # Review mutations
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    voteReview(id: ID!, isHelpful: Boolean!): Review!

    # Moderation mutations (admin only)
    moderateReview(id: ID!, input: ModerateReviewInput!): Review!

    # User interaction mutations
    toggleFavorite(novelId: ID!): Boolean!
    addBookmark(input: AddBookmarkInput!): Bookmark!
    removeBookmark(chapterId: ID!): Boolean!
    updateReadingProgress(input: UpdateReadingProgressInput!): ReadingProgress!

    # File upload mutations
    uploadImage(input: UploadImageInput!): UploadResult!
  }

  type Subscription {
    # Real-time subscriptions
    novelUpdated(novelId: ID!): Novel!
    chapterPublished(novelId: ID!): Chapter!
    reviewAdded(novelId: ID!): Review!
  }

  ${types}
  ${inputs}
`;
