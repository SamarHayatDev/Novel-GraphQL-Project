import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ValidationError } from './errors';

export interface UploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface ProcessedImage {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  url: string;
  thumbnailUrl?: string;
}

// Default configurations
export const UPLOAD_CONFIGS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 400,
    maxHeight: 400,
    quality: 85,
  },
  cover: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 1200,
    maxHeight: 1600,
    quality: 90,
  },
  chapter: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 800,
    maxHeight: 1200,
    quality: 80,
  },
} as const;

// Ensure upload directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

export const ensureUploadDirectories = async (): Promise<void> => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
    throw new Error('Failed to create upload directories');
  }
};

// Validate file
export const validateFile = (
  file: Express.Multer.File,
  config: UploadConfig
): void => {
  if (!file) {
    throw new ValidationError('No file provided');
  }

  if (file.size > config.maxSize) {
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`
    );
  }

  if (!config.allowedTypes.includes(file.mimetype)) {
    throw new ValidationError(
      `File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
    );
  }
};

// Process and save image
export const processAndSaveImage = async (
  file: Express.Multer.File,
  config: UploadConfig,
  folder: string = 'general'
): Promise<ProcessedImage> => {
  await ensureUploadDirectories();

  // Generate unique filename
  const fileExtension = path.extname(file.originalname);
  const filename = `${uuidv4()}${fileExtension}`;
  const folderPath = path.join(UPLOAD_DIR, folder);
  const filePath = path.join(folderPath, filename);

  // Ensure folder exists
  await fs.mkdir(folderPath, { recursive: true });

  // Process image with Sharp
  let sharpInstance = sharp(file.buffer);

  // Get image metadata
  const metadata = await sharpInstance.metadata();
  const { width = 0, height = 0 } = metadata;

  // Resize if needed
  if (config.maxWidth && config.maxHeight) {
    sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Set quality for JPEG/WebP
  if (config.quality) {
    if (file.mimetype === 'image/jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: config.quality });
    } else if (file.mimetype === 'image/webp') {
      sharpInstance = sharpInstance.webp({ quality: config.quality });
    } else if (file.mimetype === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: config.quality });
    }
  }

  // Save processed image
  await sharpInstance.toFile(filePath);

  // Create thumbnail if needed
  let thumbnailUrl: string | undefined;
  if (folder === 'covers' || folder === 'avatars') {
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

    await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
  }

  // Get final file size
  const stats = await fs.stat(filePath);

  return {
    filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: stats.size,
    width: metadata.width || 0,
    height: metadata.height || 0,
    url: `/uploads/${folder}/${filename}`,
    thumbnailUrl,
  };
};

// Delete file
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);

    // Also delete thumbnail if it exists
    const thumbnailPath = filePath.replace('/uploads/', '/uploads/thumbnails/thumb_');
    const fullThumbnailPath = path.join(process.cwd(), 'public', thumbnailPath);
    
    try {
      await fs.unlink(fullThumbnailPath);
    } catch (error) {
      // Thumbnail might not exist, ignore error
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error as file might already be deleted
  }
};

// Convert base64 to buffer
export const base64ToBuffer = (base64String: string): Buffer => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new ValidationError('Invalid base64 image data');
  }
};

// Create mock file from base64
export const createMockFile = (
  base64String: string,
  originalName: string = 'image.jpg'
): Express.Multer.File => {
  const buffer = base64ToBuffer(base64String);
  
  return {
    fieldname: 'image',
    originalname: originalName,
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer,
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };
};
