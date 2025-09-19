import { useState, useCallback, ChangeEvent } from 'react';
import { useToast } from './useToast';
import { apiClient } from '@/lib/api';

interface FileUploadOptions {
  maxSize?: number; // in bytes
  acceptedFormats?: string[];
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (fileUrl: string) => void;
  onError?: (error: Error) => void;
}

interface FileUploadState {
  file: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_FORMATS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function useFileUpload({
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onError,
}: FileUploadOptions = {}) {
  const { success, error: showError } = useToast();
  const [state, setState] = useState<FileUploadState>({
    file: null,
    previewUrl: null,
    isUploading: false,
    uploadProgress: 0,
    error: null,
  });

  // Validate file
  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      // Check file size
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        };
      }

      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        return {
          isValid: false,
          error: `Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`,
        };
      }

      return { isValid: true };
    },
    [maxSize, acceptedFormats]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateFile(file);
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          error: validation.error || 'Invalid file',
        }));
        showError(validation.error || 'Invalid file');
        return;
      }

      // Create preview URL for images
      let previewUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      setState({
        file,
        previewUrl,
        isUploading: false,
        uploadProgress: 0,
        error: null,
      });

      // Reset file input to allow selecting the same file again
      e.target.value = '';
    },
    [validateFile, showError]
  );

  // Upload file
  const uploadFile = useCallback(
    async (uploadUrl: string, file: File, additionalData: Record<string, any> = {}) => {
      if (!file) {
        const err = new Error('No file selected');
        setState(prev => ({ ...prev, error: err.message }));
        onError?.(err);
        showError(err.message);
        return null;
      }

      const validation = validateFile(file);
      if (!validation.isValid) {
        const err = new Error(validation.error || 'Invalid file');
        setState(prev => ({ ...prev, error: err.message }));
        onError?.(err);
        showError(err.message);
        return null;
      }

      setState(prev => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }));

      onUploadStart?.();

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Append additional data to form data
        Object.entries(additionalData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        const response = await apiClient.post<{ url: string }>(
          uploadUrl,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              
              setState(prev => ({
                ...prev,
                uploadProgress: progress,
              }));
              
              onUploadProgress?.(progress);
            },
          }
        );

        setState(prev => ({
          ...prev,
          isUploading: false,
          uploadProgress: 100,
        }));

        const fileUrl = response.data?.url;
        if (fileUrl) {
          onUploadComplete?.(fileUrl);
          success('File uploaded successfully');
          return fileUrl;
        }

        throw new Error('No file URL returned from server');
      } catch (err: any) {
        console.error('File upload error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to upload file';
        
        setState(prev => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        
        onError?.(err);
        showError(errorMessage);
        return null;
      }
    },
    [validateFile, onUploadStart, onUploadProgress, onUploadComplete, onError, showError, success]
  );

  // Clear file and state
  const clearFile = useCallback(() => {
    // Revoke object URL to avoid memory leaks
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    setState({
      file: null,
      previewUrl: null,
      isUploading: false,
      uploadProgress: 0,
      error: null,
    });
  }, [state.previewUrl]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state.previewUrl]);

  return {
    // State
    file: state.file,
    previewUrl: state.previewUrl,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    error: state.error,
    
    // Actions
    handleFileSelect,
    uploadFile,
    clearFile,
    
    // Helpers
    validateFile,
    
    // Input props
    getInputProps: () => ({
      type: 'file',
      onChange: handleFileSelect,
      accept: acceptedFormats.join(','),
      style: { display: 'none' },
    }),
    
    // Dropzone props
    getRootProps: () => ({
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        
        const validation = validateFile(file);
        if (!validation.isValid) {
          setState(prev => ({
            ...prev,
            error: validation.error || 'Invalid file',
          }));
          showError(validation.error || 'Invalid file');
          return;
        }
        
        // Create preview URL for images
        let previewUrl: string | null = null;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }
        
        setState({
          file,
          previewUrl,
          isUploading: false,
          uploadProgress: 0,
          error: null,
        });
      },
    }),
  };
}

export default useFileUpload;
