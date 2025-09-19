import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from './error';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle Prisma errors
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.[0] || 'field';
        throw AppError.conflict(`A record with this ${field} already exists`);
      
      case 'P2003':
        // Foreign key constraint violation
        throw AppError.badRequest('Invalid reference to related record');
      
      case 'P2025':
        // Record not found
        throw AppError.notFound('Record not found');
      
      default:
        console.error('Prisma error:', error);
        throw new AppError('Database error', 500);
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Handle validation errors
    console.error('Validation error:', error);
    throw AppError.badRequest('Invalid data provided');
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    // Handle database connection errors
    console.error('Database connection error:', error);
    throw new AppError('Unable to connect to database', 503);
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    // Handle Rust panics (should be rare in production)
    console.error('Database panic:', error);
    throw new AppError('A database error occurred', 500);
  }
  
  // Re-throw if not a Prisma error
  throw error;
}

// Helper function for paginated queries
export async function paginate<T, A>(
  model: any, // Prisma model type
  args: Omit<Prisma.Exact<A, any>, 'skip' | 'take'>,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const [data, total] = await Promise.all([
      model.findMany({
        ...args,
        skip: (page - 1) * limit,
        take: limit,
      }) as Promise<T[]>,
      model.count({
        where: (args as any).where,
      }) as Promise<number>,
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to check if a record exists
export async function exists<T>(
  model: any, // Prisma model type
  where: Prisma.Args<T, 'findFirst'>['where']
): Promise<boolean> {
  try {
    const count = await (model as any).count({ where });
    return count > 0;
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to get a record or throw a 404 error
export async function findOrThrow<T, A>(
  model: any, // Prisma model type
  args: Prisma.Exact<A, any>,
  notFoundMessage: string = 'Record not found'
): Promise<T> {
  try {
    const record = await model.findUnique(args);
    if (!record) {
      throw AppError.notFound(notFoundMessage);
    }
    return record;
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to create a record
export async function create<T, A>(
  model: any, // Prisma model type
  data: Prisma.Exact<A, any>
): Promise<T> {
  try {
    return await model.create({ data });
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to update a record
export async function update<T, A>(
  model: any, // Prisma model type
  args: Prisma.Exact<A, any>
): Promise<T> {
  try {
    return await model.update(args);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to delete a record
export async function remove<T, A>(
  model: any, // Prisma model type
  where: Prisma.Exact<A, any>['where']
): Promise<T> {
  try {
    return await model.delete({ where });
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to perform a transaction
export async function transaction<T>(
  callback: (prisma: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      return handlePrismaError(error);
    }
  });
}

// Export Prisma types for convenience
export { Prisma };

// Export the Prisma client as the default export
export default prisma;
