import { config } from "dotenv";
import path from "path";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

import { connectToDatabase } from "../lib/database";
import {
  User,
  Author,
  Category,
  Tag,
  Novel,
  Chapter,
  Review,
  Favorite,
  Bookmark,
  ReadingProgress,
} from "../models";

async function seedData() {
  try {
    console.log("🌱 Starting data seeding...");

    // Connect to database
    await connectToDatabase();

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Author.deleteMany({}),
      Category.deleteMany({}),
      Tag.deleteMany({}),
      Novel.deleteMany({}),
      Chapter.deleteMany({}),
      Review.deleteMany({}),
      Favorite.deleteMany({}),
      Bookmark.deleteMany({}),
      ReadingProgress.deleteMany({}),
    ]);

    // Create Users
    console.log("👥 Creating users...");
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@novel.com",
        password: "AdminPass123!",
        role: "admin",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Author Writer",
        email: "author@novel.com",
        password: "AuthorPass123!",
        role: "author",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Reader One",
        email: "reader1@novel.com",
        password: "ReaderPass123!",
        role: "reader",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Reader Two",
        email: "reader2@novel.com",
        password: "ReaderPass123!",
        role: "reader",
        isEmailVerified: true,
        isActive: true,
      },
    ]);

    // Create Authors
    console.log("✍️ Creating authors...");
    const authors = await Author.create([
      {
        name: "J.K. Rowling",
        bio: "British author best known for the Harry Potter series. She has written multiple best-selling books and is one of the most successful authors of all time.",
        avatar:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        website: "https://jkrowling.com",
        socialLinks: {
          twitter: "https://twitter.com/jk_rowling",
          instagram: "https://instagram.com/jk_rowling",
        },
        birthDate: new Date("1965-07-31"),
        nationality: "British",
      },
      {
        name: "George R.R. Martin",
        bio: "American novelist and short story writer, screenwriter, and television producer. He is best known for his series of epic fantasy novels, A Song of Ice and Fire.",
        avatar:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        website: "https://georgerrmartin.com",
        socialLinks: {
          twitter: "https://twitter.com/GRRMspeaking",
        },
        birthDate: new Date("1948-09-20"),
        nationality: "American",
      },
      {
        name: "Stephen King",
        bio: "American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. He has published over 60 novels and 200 short stories.",
        avatar:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        website: "https://stephenking.com",
        socialLinks: {
          twitter: "https://twitter.com/StephenKing",
        },
        birthDate: new Date("1947-09-21"),
        nationality: "American",
      },
    ]);

    // Create Categories
    console.log("📚 Creating categories...");
    const categories = await Category.create([
      {
        name: "Fantasy",
        description:
          "Stories involving magic, supernatural elements, and imaginary worlds.",
        slug: "fantasy",
        icon: "🧙‍♂️",
        color: "#8B5CF6",
      },
      {
        name: "Science Fiction",
        description:
          "Stories based on imagined future scientific or technological advances.",
        slug: "science-fiction",
        icon: "🚀",
        color: "#06B6D4",
      },
      {
        name: "Horror",
        description:
          "Stories designed to frighten, scare, or startle their readers.",
        slug: "horror",
        icon: "👻",
        color: "#DC2626",
      },
      {
        name: "Romance",
        description:
          "Stories focusing on the relationship and romantic love between two people.",
        slug: "romance",
        icon: "💕",
        color: "#EC4899",
      },
      {
        name: "Mystery",
        description:
          "Stories involving a mysterious death or a crime to be solved.",
        slug: "mystery",
        icon: "🔍",
        color: "#059669",
      },
    ]);

    // Create Tags
    console.log("🏷️ Creating tags...");
    const tags = await Tag.create([
      {
        name: "Magic",
        description: "Stories involving magical elements",
        slug: "magic",
        color: "#F59E0B",
      },
      {
        name: "Adventure",
        description: "Stories with exciting journeys and quests",
        slug: "adventure",
        color: "#10B981",
      },
      {
        name: "Dystopian",
        description: "Stories set in oppressive, futuristic societies",
        slug: "dystopian",
        color: "#6B7280",
      },
      {
        name: "Young Adult",
        description: "Stories targeted at young adult readers",
        slug: "young-adult",
        color: "#3B82F6",
      },
      {
        name: "Classic",
        description: "Timeless stories that have stood the test of time",
        slug: "classic",
        color: "#8B5CF6",
      },
    ]);

    // Create Novels
    console.log("📖 Creating novels...");
    const novels = await Novel.create([
      {
        title: "Harry Potter and the Philosopher's Stone",
        titleUrdu: "ہیری پوٹر اور فلسفی کا پتھر",
        description:
          "The first novel in the Harry Potter series, following the young wizard Harry Potter as he begins his education at Hogwarts School of Witchcraft and Wizardry.",
        descriptionUrdu:
          "ہیری پوٹر سیریز کا پہلا ناول، جو نوجوان جادوگر ہیری پوٹر کی ہاگوارٹس اسکول آف وِچکرافٹ اینڈ وِزرڈری میں تعلیم کے آغاز کی پیروی کرتا ہے۔",
        author: authors[0]._id,
        category: categories[0]._id,
        tags: [tags[0]._id, tags[1]._id, tags[4]._id],
        coverImage:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        status: "completed",
        language: "english",
        totalChapters: 17,
        publishedChapters: 17,
        isPublished: true,
        publishedAt: new Date("1997-06-26"),
        averageRating: 4.5,
        totalViews: 15000,
        totalFavorites: 2500,
      },
      {
        title: "A Game of Thrones",
        titleUrdu: "تختوں کا کھیل",
        description:
          "The first novel in A Song of Ice and Fire series, set in the fictional continents of Westeros and Essos.",
        descriptionUrdu:
          "آئس اینڈ فائر کی سیریز کا پہلا ناول، جو خیالی براعظموں ویسٹروس اور ایسوس میں ترتیب دیا گیا ہے۔",
        author: authors[1]._id,
        category: categories[0]._id,
        tags: [tags[1]._id, tags[4]._id],
        coverImage:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        status: "ongoing",
        language: "english",
        totalChapters: 73,
        publishedChapters: 73,
        isPublished: true,
        publishedAt: new Date("1996-08-01"),
        averageRating: 4.3,
        totalViews: 12000,
        totalFavorites: 1800,
      },
      {
        title: "The Shining",
        titleUrdu: "شائننگ",
        description:
          "A horror novel about a family's winter stay at an isolated hotel where an evil and spiritual presence influences the father into violence.",
        descriptionUrdu:
          "ایک خوفناک ناول جو ایک خاندان کی ایک الگ تھلگ ہوٹل میں سردیوں کی رہائش کے بارے میں ہے جہاں ایک برائی اور روحانی موجودگی باپ کو تشدد کی طرف راغب کرتی ہے۔",
        author: authors[2]._id,
        category: categories[2]._id,
        tags: [tags[4]._id],
        coverImage:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        status: "completed",
        language: "english",
        totalChapters: 25,
        publishedChapters: 25,
        isPublished: true,
        publishedAt: new Date("1977-01-28"),
        averageRating: 4.2,
        totalViews: 8000,
        totalFavorites: 1200,
      },
    ]);

    // Create Chapters
    console.log("📝 Creating chapters...");
    const chapters = [];

    // Chapters for Harry Potter
    for (let i = 1; i <= 17; i++) {
      chapters.push({
        novel: novels[0]._id,
        title: `Chapter ${i}: The ${
          i === 1
            ? "Boy Who Lived"
            : i === 2
            ? "Vanishing Glass"
            : i === 3
            ? "Letters from No One"
            : `Chapter ${i} Title`
        }`,
        titleUrdu: `باب ${i}: ${
          i === 1
            ? "وہ لڑکا جو زندہ رہا"
            : i === 2
            ? "غائب شیشہ"
            : i === 3
            ? "کسی کی طرف سے خطوط"
            : `باب ${i} کا عنوان`
        }`,
        content: `This is chapter ${i} of Harry Potter and the Philosopher's Stone. It contains approximately 2000 words of content describing the magical adventures of Harry Potter and his friends at Hogwarts School of Witchcraft and Wizardry. The chapter includes detailed descriptions of magical spells, potions, and the various challenges they face during their first year at the school.`,
        contentUrdu: `یہ ہیری پوٹر اور فلسفی کا پتھر کا باب ${i} ہے۔ اس میں تقریباً 2000 الفاظ کا مواد شامل ہے جو ہیری پوٹر اور اس کے دوستوں کی ہاگوارٹس اسکول آف وِچکرافٹ اینڈ وِزرڈری میں جادوئی مہم جوئی کی تفصیل بیان کرتا ہے۔ باب میں جادوئی منتر، دوائیں، اور اسکول میں ان کے پہلے سال کے دوران ان کو درپیش مختلف چیلنجز کی تفصیلی وضاحتیں شامل ہیں۔`,
        chapterNumber: i,
        wordCount: 2000,
        readingTime: 10,
        isPublished: true,
        publishedAt: new Date(1997, 5, 26 + i),
        totalViews: Math.floor(Math.random() * 1000) + 500,
        totalBookmarks: Math.floor(Math.random() * 100) + 10,
      });
    }

    // Chapters for Game of Thrones
    for (let i = 1; i <= 20; i++) {
      chapters.push({
        novel: novels[1]._id,
        title: `Chapter ${i}: ${
          i === 1
            ? "Bran"
            : i === 2
            ? "Catelyn"
            : i === 3
            ? "Daenerys"
            : `Character ${i}`
        }`,
        titleUrdu: `باب ${i}: ${
          i === 1
            ? "بران"
            : i === 2
            ? "کیٹلن"
            : i === 3
            ? "ڈینریس"
            : `کردار ${i}`
        }`,
        content: `This is chapter ${i} of A Game of Thrones. It contains approximately 3000 words of content describing the complex political intrigue and power struggles in the Seven Kingdoms of Westeros. The chapter follows various characters as they navigate the dangerous world of medieval politics, where alliances shift like sand and betrayal lurks around every corner.`,
        contentUrdu: `یہ تختوں کا کھیل کا باب ${i} ہے۔ اس میں تقریباً 3000 الفاظ کا مواد شامل ہے جو ویسٹروس کے سات بادشاہتوں میں پیچیدہ سیاسی سازشوں اور طاقت کی کشمکش کی تفصیل بیان کرتا ہے۔ باب مختلف کرداروں کی پیروی کرتا ہے جیسے وہ قرون وسطی کی سیاست کے خطرناک دنیا میں گھومتے ہیں، جہاں اتحاد ریت کی طرح بدلتے ہیں اور ہر کونے میں غداری چھپی ہوئی ہے۔`,
        chapterNumber: i,
        wordCount: 3000,
        readingTime: 15,
        isPublished: true,
        publishedAt: new Date(1996, 7, 1 + i),
        totalViews: Math.floor(Math.random() * 800) + 400,
        totalBookmarks: Math.floor(Math.random() * 80) + 8,
      });
    }

    // Chapters for The Shining
    for (let i = 1; i <= 10; i++) {
      chapters.push({
        novel: novels[2]._id,
        title: `Chapter ${i}: ${
          i === 1
            ? "Job Interview"
            : i === 2
            ? "The Hotel"
            : i === 3
            ? "The Overlook"
            : `Chapter ${i} Title`
        }`,
        titleUrdu: `باب ${i}: ${
          i === 1
            ? "ملازمت کا انٹرویو"
            : i === 2
            ? "ہوٹل"
            : i === 3
            ? "اوورلوک"
            : `باب ${i} کا عنوان`
        }`,
        content: `This is chapter ${i} of The Shining. It contains approximately 2500 words of content describing the psychological horror and supernatural elements that plague the Torrance family during their stay at the isolated Overlook Hotel. The chapter builds tension as the hotel's malevolent influence grows stronger.`,
        contentUrdu: `یہ شائننگ کا باب ${i} ہے۔ اس میں تقریباً 2500 الفاظ کا مواد شامل ہے جو نفسیاتی خوف اور مافوق الفطرت عناصر کی تفصیل بیان کرتا ہے جو ٹورنس خاندان کو الگ تھلگ اوورلوک ہوٹل میں ان کی رہائش کے دوران پریشان کرتے ہیں۔ باب تناؤ پیدا کرتا ہے جیسے ہوٹل کا بدخواہ اثر مضبوط ہوتا جاتا ہے۔`,
        chapterNumber: i,
        wordCount: 2500,
        readingTime: 12,
        isPublished: true,
        publishedAt: new Date(1977, 0, 28 + i),
        totalViews: Math.floor(Math.random() * 600) + 300,
        totalBookmarks: Math.floor(Math.random() * 60) + 6,
      });
    }

    const createdChapters = await Chapter.create(chapters);

    // Create Reviews
    console.log("⭐ Creating reviews...");
    const reviews = await Review.create([
      {
        user: users[2]._id,
        novel: novels[0]._id,
        rating: 5,
        title: "Magical Masterpiece",
        comment:
          "An absolutely wonderful start to the series. The world-building is incredible and the characters are so well-developed.",
        isApproved: true,
        approvedAt: new Date(),
        helpfulVotes: 15,
        unhelpfulVotes: 2,
      },
      {
        user: users[3]._id,
        novel: novels[0]._id,
        rating: 4,
        title: "Great Introduction",
        comment:
          "A fantastic introduction to the wizarding world. Perfect for readers of all ages.",
        isApproved: true,
        approvedAt: new Date(),
        helpfulVotes: 8,
        unhelpfulVotes: 1,
      },
      {
        user: users[2]._id,
        novel: novels[1]._id,
        rating: 5,
        title: "Epic Fantasy",
        comment:
          "Complex characters and intricate plot. Martin's world-building is unmatched.",
        isApproved: true,
        approvedAt: new Date(),
        helpfulVotes: 12,
        unhelpfulVotes: 3,
      },
      {
        user: users[3]._id,
        novel: novels[2]._id,
        rating: 4,
        title: "Psychological Horror",
        comment:
          "King at his best. The psychological elements are more terrifying than any supernatural horror.",
        isApproved: true,
        approvedAt: new Date(),
        helpfulVotes: 10,
        unhelpfulVotes: 1,
      },
    ]);

    // Create Favorites
    console.log("❤️ Creating favorites...");
    await Favorite.create([
      {
        user: users[2]._id,
        novel: novels[0]._id,
      },
      {
        user: users[2]._id,
        novel: novels[1]._id,
      },
      {
        user: users[3]._id,
        novel: novels[0]._id,
      },
      {
        user: users[3]._id,
        novel: novels[2]._id,
      },
    ]);

    // Create Bookmarks
    console.log("🔖 Creating bookmarks...");
    await Bookmark.create([
      {
        user: users[2]._id,
        novel: novels[0]._id,
        chapter: createdChapters[0]._id,
        note: "Great introduction chapter",
      },
      {
        user: users[2]._id,
        novel: novels[1]._id,
        chapter: createdChapters[17]._id,
        note: "Important plot point",
      },
      {
        user: users[3]._id,
        novel: novels[0]._id,
        chapter: createdChapters[5]._id,
        note: "Favorite scene",
      },
    ]);

    // Create Reading Progress
    console.log("📖 Creating reading progress...");
    await ReadingProgress.create([
      {
        user: users[2]._id,
        novel: novels[0]._id,
        currentChapter: createdChapters[10]._id,
        completedChapters: 10,
        totalChapters: 17,
        lastReadAt: new Date(),
        isCompleted: false,
      },
      {
        user: users[2]._id,
        novel: novels[1]._id,
        currentChapter: createdChapters[17]._id,
        completedChapters: 5,
        totalChapters: 20,
        lastReadAt: new Date(),
        isCompleted: false,
      },
      {
        user: users[3]._id,
        novel: novels[0]._id,
        currentChapter: createdChapters[17]._id,
        completedChapters: 17,
        totalChapters: 17,
        lastReadAt: new Date(),
        isCompleted: true,
      },
    ]);

    console.log("✅ Data seeding completed successfully!");
    console.log(`📊 Created:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${authors.length} authors`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${tags.length} tags`);
    console.log(`   - ${novels.length} novels`);
    console.log(`   - ${createdChapters.length} chapters`);
    console.log(`   - ${reviews.length} reviews`);
    console.log(`   - 4 favorites`);
    console.log(`   - 3 bookmarks`);
    console.log(`   - 3 reading progress entries`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
