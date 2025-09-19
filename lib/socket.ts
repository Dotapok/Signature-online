import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { EventType } from '@prisma/client';
import { logEvent } from './events';

// Define types for better type safety
type ContractEvent = {
  type: EventType;
  contractId: string;
  signerId?: string;
  data?: Record<string, unknown>;
};

type ClientToServerEvents = {
  'join:contract': (contractId: string) => void;
  'leave:contract': (contractId: string) => void;
  'signature:start': (contractId: string) => void;
  'signature:complete': (contractId: string, signatureData: { image: string }) => void;
};

type ServerToClientEvents = {
  'contract:updated': (event: ContractEvent) => void;
  'signature:requested': (data: { signerId: string; contractId: string }) => void;
  'signature:completed': (data: { signerId: string; contractId: string }) => void;
  'contract:completed': (contractId: string) => void;
};

type InterServerEvents = {
  ping: () => void;
};

type SocketData = {
  userId?: string;
  contractIds: Set<string>;
};

// Store the Socket.IO server instance
let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Initialize Socket.IO server
 */
export function initSocket(server: HttpServer): void {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.APP_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket.io',
  });

  // Middleware to authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // In a real app, verify the token and get user ID
      // For now, we'll just use the token as the user ID
      socket.data = {
        userId: token,
        contractIds: new Set(),
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a contract room
    socket.on('join:contract', (contractId: string) => {
      if (!socket.data.contractIds) {
        socket.data.contractIds = new Set();
      }
      socket.data.contractIds.add(contractId);
      socket.join(`contract:${contractId}`);
      console.log(`Socket ${socket.id} joined contract: ${contractId}`);
    });

    // Leave a contract room
    socket.on('leave:contract', (contractId: string) => {
      if (socket.data.contractIds) {
        socket.data.contractIds.delete(contractId);
      }
      socket.leave(`contract:${contractId}`);
      console.log(`Socket ${socket.id} left contract: ${contractId}`);
    });

    // Handle signature start event
    socket.on('signature:start', (contractId: string) => {
      console.log(`User started signing contract: ${contractId}`);
      
      // Log the event
      logEvent(
        'SIGNER_VIEWED',
        contractId,
        socket.data.userId,
        {},
        socket.handshake as any
      );

      // Notify other users in the same contract room
      socket.to(`contract:${contractId}`).emit('signature:requested', {
        signerId: socket.data.userId || 'unknown',
        contractId,
      });
    });

    // Handle signature completion
    socket.on('signature:complete', async (contractId: string, signatureData: { image: string }) => {
      console.log(`User completed signing contract: ${contractId}`);
      
      // In a real app, you would save the signature to the database here
      // await saveSignature(contractId, socket.data.userId, signatureData.image);
      
      // Log the event
      await logEvent(
        'SIGNER_SIGNED',
        contractId,
        socket.data.userId,
        {},
        socket.handshake as any
      );

      // Notify other users in the same contract room
      io.to(`contract:${contractId}`).emit('signature:completed', {
        signerId: socket.data.userId || 'unknown',
        contractId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

/**
 * Get the Socket.IO server instance
 */
export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Notify all users in a contract room about an update
 */
export function notifyContractUpdate(contractId: string, event: ContractEvent): void {
  if (io) {
    io.to(`contract:${contractId}`).emit('contract:updated', event);
  }
}

/**
 * Notify all users that a contract has been completed
 */
export function notifyContractCompleted(contractId: string): void {
  if (io) {
    io.to(`contract:${contractId}`).emit('contract:completed', contractId);
  }
}

/**
 * Notify a specific user about a contract update
 */
export function notifyUser(userId: string, event: ContractEvent): void {
  if (io) {
    // Find all sockets for this user
    const sockets = io.sockets.sockets as Map<string, Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>>;
    
    sockets.forEach((socket) => {
      if (socket.data.userId === userId) {
        socket.emit('contract:updated', event);
      }
    });
  }
}

/**
 * Notify all users in a contract room about a signature request
 */
export function notifySignatureRequested(contractId: string, signerId: string): void {
  if (io) {
    io.to(`contract:${contractId}`).emit('signature:requested', {
      signerId,
      contractId,
    });
  }
}

/**
 * Notify all users in a contract room about a signature completion
 */
export function notifySignatureCompleted(contractId: string, signerId: string): void {
  if (io) {
    io.to(`contract:${contractId}`).emit('signature:completed', {
      signerId,
      contractId,
    });
  }
}
