import { Response } from 'express';
import { AppError } from './error';

type SuccessResponseData<T> = {
  status: 'success';
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ErrorResponseData = {
  status: 'error';
  message: string;
  errors?: Record<string, { message: string }>;
  stack?: string;
};

type ApiResponse<T = any> = SuccessResponseData<T> | ErrorResponseData;

class ApiResponseHandler {
  /**
   * Send a successful response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Opération réussie',
    statusCode: number = 200,
    meta?: {
      page: number;
      limit: number;
      total: number;
    }
  ) {
    const response: SuccessResponseData<T> = {
      status: 'success',
      message,
      data,
    };

    // Add pagination metadata if provided
    if (meta) {
      response.meta = {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: Math.ceil(meta.total / meta.limit),
      };
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response
   */
  static paginate<T>(
    res: Response,
    data: T[], 
    total: number,
    page: number = 1,
    limit: number = 10,
    message: string = 'Données récupérées avec succès'
  ) {
    return this.success(
      res,
      data,
      message,
      200,
      { page: Number(page), limit: Number(limit), total: Number(total) }
    );
  }

  /**
   * Send an error response
   */
  static error(res: Response, error: Error | AppError | any) {
    let statusCode = 500;
    let message = 'Une erreur est survenue';
    let errors: Record<string, { message: string }> | undefined;

    // Handle custom AppError
    if (error instanceof AppError) {
      statusCode = error.statusCode;
      message = error.message;
      errors = error.errors;
    } 
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Token invalide';
    } 
    // Handle validation errors
    else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Erreur de validation';
      errors = Object.keys(error.errors).reduce((acc, key) => ({
        ...acc,
        [key]: { message: error.errors[key].message },
      }), {});
    }
    // Handle MongoDB duplicate key errors
    else if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyValue)[0];
      message = `La valeur '${error.keyValue[field]}' existe déjà pour le champ '${field}'`;
    }

    const response: ErrorResponseData = {
      status: 'error',
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a not found response
   */
  static notFound(res: Response, message: string = 'Ressource non trouvée') {
    return res.status(404).json({
      status: 'error',
      message,
    });
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Non autorisé') {
    return res.status(401).json({
      status: 'error',
      message,
    });
  }

  /**
   * Send a forbidden response
   */
  static forbidden(res: Response, message: string = 'Accès refusé') {
    return res.status(403).json({
      status: 'error',
      message,
    });
  }

  /**
   * Send a bad request response
   */
  static badRequest(res: Response, message: string = 'Requête invalide', errors?: Record<string, string>) {
    return res.status(400).json({
      status: 'error',
      message,
      ...(errors && { errors }),
    });
  }

  /**
   * Send a conflict response
   */
  static conflict(res: Response, message: string = 'Conflit détecté') {
    return res.status(409).json({
      status: 'error',
      message,
    });
  }

  /**
   * Send a created response
   */
  static created<T>(res: Response, data: T, message: string = 'Ressource créée avec succès') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send a no content response
   */
  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export default ApiResponseHandler;
