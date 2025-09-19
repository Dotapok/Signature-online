import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EventType, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getClientIp } from 'request-ip';
import { NextApiRequest } from 'next';

const prisma = new PrismaClient();

// Types for socket events
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

// Initialize Socket.IO server
let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function initSocket(server: HttpServer): void {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.APP_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware to authenticate socket connection
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token and get user ID
      // This is a simplified example - you'll need to implement your own auth logic
      const payload = { userId: token }; // In a real app, verify the token
      
      socket.data = {
        userId: payload.userId,
        contractIds: new Set(),
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
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
      // Notify other users in the same contract room
      socket.to(`contract:${contractId}`).emit('signature:requested', {
        signerId: socket.data.userId || 'unknown',
        contractId,
      });
    });

    // Handle signature completion
    socket.on('signature:complete', async (contractId: string, signatureData: { image: string }) => {
      console.log(`User completed signing contract: ${contractId}`);
      // Save signature to database (pseudo-code)
      // await saveSignature(contractId, socket.data.userId, signatureData.image);
      
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

// Log an event to the database
export async function logEvent(
  type: EventType,
  contractId: string,
  signerId?: string,
  data?: Record<string, unknown>,
  req?: NextApiRequest
): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        id: uuidv4(),
        type,
        contractId,
        signerId: signerId || null,
        data: data || {},
        ipAddress: req ? getClientIp(req) : null,
        userAgent: req?.headers['user-agent'] || null,
      },
    });

    // Emit real-time update if this is a significant event
    if (io) {
      const event: ContractEvent = { type, contractId, signerId, data };
      io.to(`contract:${contractId}`).emit('contract:updated', event);
      
      // If this is a completion event, notify all participants
      if (type === 'CONTRACT_COMPLETED') {
        io.to(`contract:${contractId}`).emit('contract:completed', contractId);
      }
    }
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

// Notify all users in a contract room
export function notifyContractUpdate(contractId: string, event: ContractEvent): void {
  if (io) {
    io.to(`contract:${contractId}`).emit('contract:updated', event);
  }
}

// Get the Socket.IO server instance
export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
