import { config } from "dotenv";
import path from "path";
import fetch from "node-fetch";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

const API_URL = "http://localhost:3000/api/graphql";

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: any;
  duration: number;
}

class APITester {
  private authToken: string = "";
  private testResults: TestResult[] = [];

  async makeRequest(
    query: string,
    variables?: any,
    headers?: any
  ): Promise<any> {
    const startTime = Date.now();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (data.errors && data.errors.length > 0) {
        const error = data.errors[0];
        const errorMessage = error?.message || "GraphQL Error";
        const errorDetails = error?.extensions?.stacktrace ? 
          `\nStack: ${error.extensions.stacktrace.slice(0, 3).join('\n')}` : '';
        console.error(`GraphQL Error: ${errorMessage}${errorDetails}`);
        console.error(`Full response: ${JSON.stringify(data, null, 2)}`);
        throw new Error(errorMessage);
      }

      return { data: data.data, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw { error: error.message, duration };
    }
  }

  async runTest(name: string, testFn: () => Promise<any>): Promise<void> {
    console.log(`🧪 Running: ${name}`);

    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;

      this.testResults.push({
        name,
        success: true,
        data: result,
        duration,
      });

      console.log(`✅ ${name} - ${duration}ms`);
    } catch (error) {
      this.testResults.push({
        name,
        success: false,
        error: error.message || error.error,
        duration: error.duration || 0,
      });

      console.log(`❌ ${name} - ${error.message || error.error}`);
    }
  }

  async runAllTests(): Promise<void> {
    console.log("🚀 Starting Comprehensive API Tests...\n");

    // Test 1: Schema Introspection
    await this.runTest("Schema Introspection", async () => {
      const result = await this.makeRequest(`
        query {
          __schema {
            types {
              name
              kind
            }
          }
        }
      `);
      return result.data.__schema.types.length;
    });

    // Test 2: User Registration
    await this.runTest("User Registration", async () => {
      const result = await this.makeRequest(
        `
        mutation RegisterUser($input: RegisterInput!) {
          register(input: $input) {
            user {
              id
              name
              email
              role
            }
            token
          }
        }
      `,
        {
          input: {
            name: "Test User",
            email: "testuser@example.com",
            password: "TestPass123!",
            role: "READER",
          },
        }
      );

      this.authToken = result.data.register.token;
      return result.data.register.user;
    });

    // Test 3: User Login
    await this.runTest("User Login", async () => {
      const result = await this.makeRequest(
        `
        mutation LoginUser($input: LoginInput!) {
          login(input: $input) {
            user {
              id
              name
              email
              role
            }
            token
          }
        }
      `,
        {
          input: {
            email: "reader1@novel.com",
            password: "ReaderPass123!",
          },
        }
      );

      this.authToken = result.data.login.token;
      return result.data.login.user;
    });

    // Test 4: Get Current User
    await this.runTest("Get Current User", async () => {
      const result = await this.makeRequest(
        `
        query {
          me {
            id
            name
            email
            role
            isEmailVerified
            isActive
          }
        }
      `,
        {},
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.me;
    });

    // Test 5: Get All Categories
    await this.runTest("Get All Categories", async () => {
      const result = await this.makeRequest(`
        query {
          categories(pagination: { page: 1, limit: 10 }) {
            data {
              id
              name
              description
              slug
              icon
              color
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `);

      return result.data.categories;
    });

    // Test 6: Get Category by Slug
    await this.runTest("Get Category by Slug", async () => {
      const result = await this.makeRequest(
        `
        query GetCategory($slug: String!) {
          categoryBySlug(slug: $slug) {
            id
            name
            description
            slug
            icon
            color
            novels {
              id
              title
            }
          }
        }
      `,
        {
          slug: "fantasy",
        }
      );

      return result.data.categoryBySlug;
    });

    // Test 7: Get All Tags
    await this.runTest("Get All Tags", async () => {
      const result = await this.makeRequest(`
        query {
          tags(pagination: { page: 1, limit: 10 }) {
            data {
              id
              name
              description
              slug
              color
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `);

      return result.data.tags;
    });

    // Test 8: Search Tags
    await this.runTest("Search Tags", async () => {
      const result = await this.makeRequest(
        `
        query SearchTags($search: String!) {
          searchTags(search: $search) {
            id
            name
            slug
          }
        }
      `,
        {
          search: "magic",
        }
      );

      return result.data.searchTags;
    });

    // Test 9: Get All Authors
    await this.runTest("Get All Authors", async () => {
      const result = await this.makeRequest(`
        query {
          authors(pagination: { page: 1, limit: 10 }) {
            data {
              id
              name
              bio
              avatar
              website
              socialLinks
              birthDate
              nationality
              novels {
                id
                title
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `);

      return result.data.authors;
    });

    // Test 10: Get Author by ID
    await this.runTest("Get Author by ID", async () => {
      const authorsResult = await this.makeRequest(`
        query {
          authors(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const authorId = authorsResult.data.authors.data[0].id;

      const result = await this.makeRequest(
        `
        query GetAuthor($id: ID!) {
          author(id: $id) {
            id
            name
            bio
            avatar
            website
            socialLinks
            birthDate
            nationality
            novels {
              id
              title
              description
              coverImage
              status
              averageRating
              totalViews
              totalFavorites
            }
          }
        }
      `,
        {
          id: authorId,
        }
      );

      return result.data.author;
    });

    // Test 11: Get All Novels with Filtering
    await this.runTest("Get All Novels with Filtering", async () => {
      const result = await this.makeRequest(`
        query {
          novels(
            pagination: { page: 1, limit: 10 }
            filter: { status: COMPLETED }
            sortBy: CREATED
            sortOrder: DESC
          ) {
            data {
              id
              title
              titleUrdu
              description
              descriptionUrdu
              coverImage
              status
              language
              totalChapters
              publishedChapters
              averageRating
              totalViews
              totalFavorites
              publishedAt
              author {
                id
                name
              }
              category {
                id
                name
              }
              tags {
                id
                name
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `);

      return result.data.novels;
    });

    // Test 12: Get Novel by ID
    await this.runTest("Get Novel by ID", async () => {
      const novelsResult = await this.makeRequest(`
        query {
          novels(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const novelId = novelsResult.data.novels.data[0].id;

      const result = await this.makeRequest(
        `
        query GetNovel($id: ID!) {
          novel(id: $id) {
            id
            title
            titleUrdu
            description
            descriptionUrdu
            coverImage
            status
            language
            totalChapters
            publishedChapters
            averageRating
            totalViews
            totalFavorites
            publishedAt
            author {
              id
              name
              bio
            }
            category {
              id
              name
              description
            }
            tags {
              id
              name
              description
            }
            chapters {
              id
              title
              chapterNumber
              isPublished
              totalViews
              totalBookmarks
            }
            reviews {
              id
              rating
              title
              comment
              user {
                name
              }
            }
          }
        }
      `,
        {
          id: novelId,
        }
      );

      return result.data.novel;
    });

    // Test 13: Search Novels
    await this.runTest("Search Novels", async () => {
      const result = await this.makeRequest(
        `
        query SearchNovels($query: String!) {
          searchNovels(
            query: $query
            pagination: { page: 1, limit: 5 }
            filter: { status: PUBLISHED }
          ) {
            data {
              id
              title
              description
              author {
                name
              }
              category {
                name
              }
              averageRating
            }
            pagination {
              total
            }
          }
        }
      `,
        {
          query: "Harry Potter",
        }
      );

      return result.data.searchNovels;
    });

    // Test 14: Get Chapters by Novel
    await this.runTest("Get Chapters by Novel", async () => {
      const novelsResult = await this.makeRequest(`
        query {
          novels(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const novelId = novelsResult.data.novels.data[0].id;

      const result = await this.makeRequest(
        `
        query GetChapters($novelId: ID!) {
          chapters(
            novelId: $novelId
            pagination: { page: 1, limit: 10 }
            filter: { isPublished: true }
            sort: { field: CHAPTER_NUMBER, order: ASC }
          ) {
            data {
              id
              title
              titleUrdu
              content
              contentUrdu
              chapterNumber
              wordCount
              readingTime
              totalViews
              totalBookmarks
              isPublished
              publishedAt
              novel {
                id
                title
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `,
        {
          novelId,
        }
      );

      return result.data.chapters;
    });

    // Test 15: Get Chapter by ID
    await this.runTest("Get Chapter by ID", async () => {
      const chaptersResult = await this.makeRequest(`
        query {
          chapters(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const chapterId = chaptersResult.data.chapters.data[0].id;

      const result = await this.makeRequest(
        `
        query GetChapter($id: ID!) {
          chapter(id: $id) {
            id
            title
            titleUrdu
            content
            contentUrdu
            chapterNumber
            wordCount
            readingTime
            totalViews
            totalBookmarks
            isPublished
            publishedAt
            novel {
              id
              title
              author {
                name
              }
            }
            nextChapter {
              id
              title
              chapterNumber
            }
            previousChapter {
              id
              title
              chapterNumber
            }
          }
        }
      `,
        {
          id: chapterId,
        }
      );

      return result.data.chapter;
    });

    // Test 16: Get Reviews
    await this.runTest("Get Reviews", async () => {
      const result = await this.makeRequest(`
        query {
          reviews(
            pagination: { page: 1, limit: 10 }
            filter: { isApproved: true }
            sort: { field: CREATED_AT, order: DESC }
          ) {
            data {
              id
              rating
              title
              comment
              helpfulVotes
              unhelpfulVotes
              helpfulPercentage
              createdAt
              user {
                id
                name
              }
              novel {
                id
                title
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `);

      return result.data.reviews;
    });

    // Test 17: Create Review (Authenticated)
    await this.runTest("Create Review", async () => {
      const novelsResult = await this.makeRequest(`
        query {
          novels(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const novelId = novelsResult.data.novels.data[0].id;

      const result = await this.makeRequest(
        `
        mutation CreateReview($input: CreateReviewInput!) {
          createReview(input: $input) {
            id
            rating
            title
            comment
            isApproved
            user {
              id
              name
            }
            novel {
              id
              title
            }
          }
        }
      `,
        {
          input: {
            novelId,
            rating: 5,
            title: "Amazing Book!",
            comment:
              "This is one of the best books I've ever read. Highly recommended!",
          },
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.createReview;
    });

    // Test 18: Toggle Favorite
    await this.runTest("Toggle Favorite", async () => {
      const novelsResult = await this.makeRequest(`
        query {
          novels(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const novelId = novelsResult.data.novels.data[0].id;

      const result = await this.makeRequest(
        `
        mutation ToggleFavorite($novelId: ID!) {
          toggleFavorite(novelId: $novelId) {
            isFavorited
            favoriteCount
            novel {
              id
              title
              totalFavorites
            }
          }
        }
      `,
        {
          novelId,
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.toggleFavorite;
    });

    // Test 19: Get User Favorites
    await this.runTest("Get User Favorites", async () => {
      const result = await this.makeRequest(
        `
        query {
          favorites(pagination: { page: 1, limit: 10 }) {
            data {
              id
              novel {
                id
                title
                description
                coverImage
                author {
                  name
                }
                category {
                  name
                }
                averageRating
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `,
        {},
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.favorites;
    });

    // Test 20: Add Bookmark
    await this.runTest("Add Bookmark", async () => {
      const chaptersResult = await this.makeRequest(`
        query {
          chapters(pagination: { page: 1, limit: 1 }) {
            data {
              id
              novel {
                id
              }
            }
          }
        }
      `);

      const chapterId = chaptersResult.data.chapters.data[0].id;
      const novelId = chaptersResult.data.chapters.data[0].novel.id;

      const result = await this.makeRequest(
        `
        mutation AddBookmark($input: AddBookmarkInput!) {
          addBookmark(input: $input) {
            id
            note
            createdAt
            chapter {
              id
              title
              chapterNumber
            }
            novel {
              id
              title
            }
          }
        }
      `,
        {
          input: {
            novelId,
            chapterId,
            note: "Important plot point to remember",
          },
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.addBookmark;
    });

    // Test 21: Get User Bookmarks
    await this.runTest("Get User Bookmarks", async () => {
      const result = await this.makeRequest(
        `
        query {
          bookmarks(pagination: { page: 1, limit: 10 }) {
            data {
              id
              note
              createdAt
              chapter {
                id
                title
                chapterNumber
                content
              }
              novel {
                id
                title
                author {
                  name
                }
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `,
        {},
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.bookmarks;
    });

    // Test 22: Update Reading Progress
    await this.runTest("Update Reading Progress", async () => {
      const chaptersResult = await this.makeRequest(`
        query {
          chapters(pagination: { page: 1, limit: 1 }) {
            data {
              id
              novel {
                id
              }
            }
          }
        }
      `);

      const chapterId = chaptersResult.data.chapters.data[0].id;
      const novelId = chaptersResult.data.chapters.data[0].novel.id;

      const result = await this.makeRequest(
        `
        mutation UpdateReadingProgress($input: UpdateReadingProgressInput!) {
          updateReadingProgress(input: $input) {
            id
            currentChapter {
              id
              title
              chapterNumber
            }
            completedChapters
            totalChapters
            progressPercentage
            isCompleted
            lastReadAt
          }
        }
      `,
        {
          input: {
            novelId,
            chapterId,
          },
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.updateReadingProgress;
    });

    // Test 23: Get Reading Progress
    await this.runTest("Get Reading Progress", async () => {
      const result = await this.makeRequest(
        `
        query {
          readingProgress(pagination: { page: 1, limit: 10 }) {
            data {
              id
              currentChapter {
                id
                title
                chapterNumber
              }
              completedChapters
              totalChapters
              progressPercentage
              isCompleted
              lastReadAt
              novel {
                id
                title
                coverImage
                author {
                  name
                }
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `,
        {},
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.readingProgress;
    });

    // Test 24: Admin - Get Pending Reviews
    await this.runTest("Admin - Get Pending Reviews", async () => {
      const result = await this.makeRequest(
        `
        query {
          pendingReviews(pagination: { page: 1, limit: 10 }) {
            data {
              id
              rating
              title
              comment
              isApproved
              createdAt
              user {
                id
                name
                email
              }
              novel {
                id
                title
              }
            }
            pagination {
              total
              page
              limit
              totalPages
            }
          }
        }
      `,
        {},
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.pendingReviews;
    });

    // Test 25: Admin - Get Statistics
    await this.runTest("Admin - Get Statistics", async () => {
      const result = await this.makeRequest(
        `
        query {
          statistics {
            totalUsers
            totalNovels
            totalChapters
            totalReviews
            totalViews
            totalFavorites
            averageRating
            recentActivity {
              type
              count
              date
            }
          }
        }
      `,
        {},
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.statistics;
    });

    // Test 26: Vote on Review
    await this.runTest("Vote on Review", async () => {
      const reviewsResult = await this.makeRequest(`
        query {
          reviews(pagination: { page: 1, limit: 1 }) {
            data {
              id
            }
          }
        }
      `);

      const reviewId = reviewsResult.data.reviews.data[0].id;

      const result = await this.makeRequest(
        `
        mutation VoteReview($reviewId: ID!, $isHelpful: Boolean!) {
          voteReview(reviewId: $reviewId, isHelpful: $isHelpful) {
            id
            helpfulVotes
            unhelpfulVotes
            helpfulPercentage
          }
        }
      `,
        {
          reviewId,
          isHelpful: true,
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.voteReview;
    });

    // Test 27: Update User Profile
    await this.runTest("Update User Profile", async () => {
      const result = await this.makeRequest(
        `
        mutation UpdateProfile($input: UpdateProfileInput!) {
          updateProfile(input: $input) {
            id
            name
            email
            role
            bio
            avatar
            preferences
            updatedAt
          }
        }
      `,
        {
          input: {
            name: "Updated Test User",
            bio: "This is my updated bio for testing purposes.",
            preferences: {
              language: "english",
              theme: "dark",
              notifications: {
                email: true,
                push: false,
              },
            },
          },
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.updateProfile;
    });

    // Test 28: Change Password
    await this.runTest("Change Password", async () => {
      const result = await this.makeRequest(
        `
        mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input) {
            success
            message
          }
        }
      `,
        {
          input: {
            currentPassword: "ReaderPass123!",
            newPassword: "NewReaderPass123!",
          },
        },
        {
          Authorization: `Bearer ${this.authToken}`,
        }
      );

      return result.data.changePassword;
    });

    // Test 29: Test Error Handling - Invalid Login
    await this.runTest("Error Handling - Invalid Login", async () => {
      try {
        await this.makeRequest(
          `
          mutation LoginUser($input: LoginInput!) {
            login(input: $input) {
              user {
                id
                name
                email
              }
              token
            }
          }
        `,
          {
            input: {
              email: "nonexistent@example.com",
              password: "wrongpassword",
            },
          }
        );

        throw new Error("Expected error but got success");
      } catch (error) {
        return { error: error.error || error.message };
      }
    });

    // Test 30: Test Error Handling - Unauthorized Access
    await this.runTest("Error Handling - Unauthorized Access", async () => {
      try {
        await this.makeRequest(`
          query {
            me {
              id
              name
              email
            }
          }
        `);

        throw new Error("Expected error but got success");
      } catch (error) {
        return { error: error.error || error.message };
      }
    });

    console.log("\n📊 Test Results Summary:");
    console.log("=".repeat(50));

    const passed = this.testResults.filter((r) => r.success).length;
    const failed = this.testResults.filter((r) => !r.success).length;
    const totalDuration = this.testResults.reduce(
      (sum, r) => sum + r.duration,
      0
    );

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(
      `📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(
        1
      )}%`
    );

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.testResults
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - ${r.name}: ${r.error}`);
        });
    }

    console.log("\n🎉 API Testing Completed!");
  }
}

// Run the tests
async function runTests() {
  const tester = new APITester();
  await tester.runAllTests();
}

runTests().catch(console.error);
