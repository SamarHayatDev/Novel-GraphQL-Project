import { GraphQLContext } from "../lib/context";
import { requireAuth } from "../lib/context";
import { ValidationError } from "../lib/errors";
import { 
  processAndSaveImage, 
  validateFile, 
  UPLOAD_CONFIGS, 
  createMockFile,
  UploadType 
} from "../lib/upload";

export const uploadResolvers = {
  Mutation: {
    uploadImage: async (_parent: any, { input }: any, context: GraphQLContext) => {
      console.log("🔍 Upload resolver called with input:", input);
      
      try {
        // Check authentication
        if (!context.isAuthenticated || !context.user) {
          throw new ValidationError("Authentication required");
        }

        const { base64Data, type, folder } = input;

        if (!base64Data) {
          throw new ValidationError("Base64 image data is required");
        }

        // Convert enum to lowercase for config lookup
        const configKey = type.toLowerCase() as keyof typeof UPLOAD_CONFIGS;
        
        if (!UPLOAD_CONFIGS[configKey]) {
          throw new ValidationError("Invalid upload type. Must be: AVATAR, COVER, or CHAPTER");
        }

        // Create mock file from base64
        const mockFile = createMockFile(base64Data, `image_${Date.now()}.jpg`);
        
        // Validate file
        const config = UPLOAD_CONFIGS[configKey];
        validateFile(mockFile, config);

        // Process and save image
        const result = await processAndSaveImage(mockFile, config, folder || configKey);

        console.log("✅ Upload successful, returning result");
        return {
          success: true,
          filename: result.filename,
          originalName: result.originalName,
          mimetype: result.mimetype,
          size: result.size,
          width: result.width,
          height: result.height,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
        };
      } catch (error) {
        console.error("❌ Upload error:", error);
        throw error;
      }
    },
  },
};
