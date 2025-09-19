import { randomBytes } from 'crypto';
import { extname } from 'path';
import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from './error';
import { storage } from './storage';
import { config } from './config';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

// Configure multer storage
const multerStorage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!config.contract.allowedFileTypes.includes(file.mimetype)) {
    return cb(
      new AppError(
        `Type de fichier non supporté. Types acceptés: ${config.contract.allowedFileTypes.join(
          ', '
        )}`,
        400
      )
    );
  }
  
  if (file.size > config.contract.maxFileSize) {
    return cb(
      new AppError(
        `Le fichier est trop volumineux. Taille maximale: ${
          config.contract.maxFileSize / 1024 / 1024
        }MB`,
        400
      )
    );
  }
  
  cb(null, true);
};

// Generate a unique filename
const generateUniqueFilename = (originalname: string): string => {
  const ext = extname(originalname);
  const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  return `${uniqueSuffix}${ext}`;
};

// Configure multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: {
    fileSize: config.contract.maxFileSize,
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Middleware for multiple file uploads
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

// Process uploaded file and save to storage
export const processFileUpload = async (
  file: Express.Multer.File,
  userId: string,
  metadata: Record<string, string> = {}
): Promise<{
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  key: string;
  url: string;
}> => {
  try {
    if (!file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    // Generate a unique key for the file
    const key = generateFileKey(userId, file.originalname);
    
    // Upload the file to storage
    await storage.uploadFile(file.buffer, key, file.mimetype, metadata);
    
    // Get the public URL of the file
    const url = await storage.getSignedUrl(key);

    return {
      originalname: file.originalname,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      key,
      url,
    };
  } catch (error) {
    console.error('Error processing file upload:', error);
    throw new AppError(
      'Une erreur est survenue lors du téléchargement du fichier',
      500
    );
  }
};

// Delete a file from storage
export const deleteFile = async (key: string): Promise<void> => {
  try {
    await storage.deleteFile(key);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error if file deletion fails
  }
};

// Generate a file key for storage
export const generateFileKey = (userId: string, originalname: string): string => {
  const timestamp = Date.now();
  const randomString = randomBytes(4).toString('hex');
  const safeFilename = originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
  return `users/${userId}/files/${timestamp}-${randomString}-${safeFilename}`;
};

// Get file extension from mimetype
export const getFileExtension = (mimetype: string): string => {
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'text/plain': '.txt',
  };
  
  return extensions[mimetype] || '';
};
