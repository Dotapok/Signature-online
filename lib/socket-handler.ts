import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/next';
import { initSocket } from './socket';

// This is a workaround for Next.js API routes with WebSockets
// We need to attach the Socket.IO server to the Next.js response object
// so we can access it in our API routes

export const config = {
  api: {
    bodyParser: false,
  },
};

// Keep track of the Socket.IO server instance
let io: ServerIO | null = null;

// Initialize the Socket.IO server
const initializeSocket = (res: NextApiResponseServerIO) => {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    // Create HTTP server if it doesn't exist
    const httpServer: HttpServer = res.socket?.server as any;
    
    // Create Socket.IO server
    io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
    
    // Initialize socket handlers
    initSocket(httpServer);
    
    // Store the Socket.IO instance on the response object
    res.socket.server.io = io;
  }
  
  return io;
};

// Socket.IO API route handler
export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  // Handle WebSocket upgrade
  if (req.method === 'GET') {
    // Initialize Socket.IO if needed
    if (!res.socket.server.io) {
      initializeSocket(res);
    }
    
    res.status(200).json({ success: true, message: 'Socket.IO initialized' });
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
