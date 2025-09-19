import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

// Extend Next.js response type to include Socket.IO
export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Type for authenticated user in Next.js API routes
export type NextApiRequestWithUser = NextApiRequest & {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
};

// Type for authenticated API handler
export type NextApiHandlerWithUser<T = any> = (
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>
) => void | Promise<void>;

// Type for API response data
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

// Type for paginated API response
export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Type for file upload
export type FileUpload = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

// Type for authenticated user session
export type UserSession = {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  expires: string;
  accessToken?: string;
};

// Type for API error response
export type ApiError = {
  statusCode: number;
  message: string;
  error?: string;
  validationErrors?: Record<string, string[]>;
};

// Type for API request with query parameters
export type ApiRequestQuery = {
  [key: string]: string | string[] | undefined;
};

// Type for API request with body
export type ApiRequestBody<T = any> = T;

// Type for API request with params
export type ApiRequestParams = {
  [key: string]: string | string[];
};

// Type for API route configuration
export type ApiRouteConfig = {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  methods: string[];
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

// Type for API route with middleware
export type ApiRouteWithMiddleware = {
  config?: {
    api?: {
      bodyParser?: boolean | {
        sizeLimit?: string;
      };
    };
  };
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

// Type for API route with file upload
export type ApiRouteWithFileUpload = {
  config: {
    api: {
      bodyParser: false;
    };
  };
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

// Type for API route with CORS
export type ApiRouteWithCors = {
  config: {
    cors: {
      origin: string | string[];
      methods: string[];
      allowedHeaders: string[];
    };
  };
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};
