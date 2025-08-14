import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import { processAndSaveImage, validateFile, UPLOAD_CONFIGS } from '../../../lib/upload';
import { requireAuth } from '../../../lib/context';
import { ValidationError } from '../../../lib/errors';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Helper to run multer middleware
const runMiddleware = (req: NextRequest, res: NextResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar', 'cover', 'chapter'
    const folder = formData.get('folder') as string || type;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !UPLOAD_CONFIGS[type as keyof typeof UPLOAD_CONFIGS]) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be: avatar, cover, or chapter' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create mock file object for validation
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      buffer,
      size: file.size,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    // Validate file
    const config = UPLOAD_CONFIGS[type as keyof typeof UPLOAD_CONFIGS];
    validateFile(mockFile, config);

    // Process and save image
    const result = await processAndSaveImage(mockFile, config, folder);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
