export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  keyValue?: Record<string, unknown>;
  value?: string;
  errors?: Record<string, { message: string }>;
  path?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  // Bad Request Error
  static badRequest(message: string = 'Requête invalide') {
    return new AppError(message, 400);
  }

  // Unauthorized Error
  static unauthorized(message: string = 'Non autorisé') {
    return new AppError(message, 401);
  }

  // Forbidden Error
  static forbidden(message: string = 'Accès refusé') {
    return new AppError(message, 403);
  }

  // Not Found Error
  static notFound(message: string = 'Ressource non trouvée') {
    return new AppError(message, 404);
  }

  // Conflict Error
  static conflict(message: string = 'Conflit') {
    return new AppError(message, 409);
  }

  // Validation Error
  static validationError(errors: Record<string, string>) {
    const error = new AppError('Erreur de validation', 400);
    error.errors = Object.entries(errors).reduce(
      (acc, [key, message]) => {
        acc[key] = { message };
        return acc;
      },
      {} as Record<string, { message: string }>
    );
    return error;
  }

  // Handle MongoDB duplicate key errors
  static handleDuplicateKeyError(err: any) {
    const key = Object.keys(err.keyValue)[0];
    const message = `La valeur '${err.keyValue[key]}' existe déjà pour le champ '${key}'.`;
    return new AppError(message, 400);
  }

  // Handle MongoDB validation errors
  static handleValidationError(err: any) {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Données d'entrée invalides : ${errors.join('. ')}`;
    return new AppError(message, 400);
  }

  // Handle JWT errors
  static handleJWTError() {
    return new AppError('Token invalide. Veuillez vous reconnecter.', 401);
  }

  static handleJWTExpiredError() {
    return new AppError(
      'Votre session a expiré. Veuillez vous reconnecter.',
      401
    );
  }

  // Handle CastError (invalid ID format)
  static handleCastErrorDB(err: any) {
    const message = `Format d'identifiant invalide : ${err.value}`;
    return new AppError(message, 400);
  }

  // Format error for API responses
  toJSON() {
    return {
      status: 'error',
      statusCode: this.statusCode,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

// Global error handling middleware
export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {
  // Set default values for the error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'ID ${err.value}`;
    err = new AppError(message, 404);
  }

  if (err.code === 11000) {
    err = AppError.handleDuplicateKeyError(err);
  }

  if (err.name === 'ValidationError') {
    err = AppError.handleValidationError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    err = AppError.handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    err = AppError.handleJWTExpiredError();
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Handle 404 routes
export const notFoundHandler = (req: any, res: any) => {
  res.status(404).json({
    status: 'error',
    message: `Impossible de trouver ${req.originalUrl} sur ce serveur.`,
  });
};
