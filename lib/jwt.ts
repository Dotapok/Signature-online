import jwt from 'jsonwebtoken';
import config from './config';

type TokenPayload = {
  signerId: string;
  contractId: string;
  email: string;
  exp?: number;
};

/**
 * Generate a JWT token for a signer
 */
export function generateToken(payload: Omit<TokenPayload, 'exp'>, expiresIn: string | number = '7d'): string {
  return jwt.sign(
    { 
      ...payload,
      exp: Math.floor(Date.now() / 1000) + (typeof expiresIn === 'string' ? 
        (parseInt(expiresIn) * 24 * 60 * 60) : expiresIn) // Convert days to seconds if string
    },
    config.jwt.secret,
    { algorithm: 'HS256' }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Generate a signature token for a signer
 * This is a short-lived token used for signature links
 */
export function generateSignatureToken(signerId: string, contractId: string, email: string): string {
  return generateToken(
    { signerId, contractId, email },
    '1h' // Short expiration for security
  );
}

/**
 * Verify a signature token
 */
export function verifySignatureToken(token: string): { signerId: string; contractId: string; email: string } {
  const payload = verifyToken(token);
  return {
    signerId: payload.signerId,
    contractId: payload.contractId,
    email: payload.email,
  };
}

/**
 * Generate an access token for API authentication
 */
export function generateAccessToken(userId: string, email: string): string {
  return generateToken(
    { signerId: userId, contractId: '', email },
    '1d' // Longer expiration for access tokens
  );
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): { userId: string; email: string } {
  const payload = verifyToken(token);
  return {
    userId: payload.signerId,
    email: payload.email,
  };
}
