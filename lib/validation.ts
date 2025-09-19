import { z } from 'zod';
import { AppError } from './error';

export const validateWithZod = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage: string = 'Erreur de validation'
): T => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.reduce((acc, error) => {
      const path = error.path.join('.');
      return { ...acc, [path]: error.message };
    }, {} as Record<string, string>);
    
    throw AppError.validationError(errors);
  }
  
  return result.data;
};

// Common validation schemas
export const schemas = {
  // Email validation
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
  
  // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  
  // Name validation (letters, spaces, hyphens, apostrophes)
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(
      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
      'Nom invalide'
    ),
  
  // Phone number validation (international format)
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Numéro de téléphone invalide. Utilisez le format international (ex: +33612345678)'
    ),
  
  // URL validation
  url: z.string().url('URL invalide'),
  
  // Date validation (ISO 8601)
  date: z.string().refine(
    (value) => !isNaN(Date.parse(value)),
    'Date invalide. Utilisez le format ISO 8601 (ex: 2023-01-01T00:00:00.000Z)'
  ),
  
  // File validation
  file: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number().int().positive(),
    buffer: z.instanceof(Buffer),
  }),
  
  // Pagination query params
  pagination: z.object({
    page: z.preprocess(
      (val) => (val ? Number(val) : 1),
      z.number().int().positive().default(1)
    ),
    limit: z.preprocess(
      (val) => (val ? Number(val) : 10),
      z.number().int().positive().max(100).default(10)
    ),
    sort: z.string().optional(),
    search: z.string().optional(),
  }),
  
  // Contract validation
  contract: {
    create: z.object({
      title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères'),
      description: z.string().optional(),
      file: z.any().refine((file) => file, 'Le fichier est requis'),
      signers: z.array(
        z.object({
          email: z.string().email('Email invalide'),
          name: z.string().min(1, 'Le nom est requis'),
        })
      ).min(1, 'Au moins un signataire est requis'),
      expiresAt: z.string().optional(),
    }),
    
    sign: z.object({
      signature: z.string().min(1, 'La signature est requise'),
      name: z.string().min(1, 'Votre nom est requis'),
      email: z.string().email('Email invalide'),
    }),
  },
  
  // User validation
  user: {
    register: z.object({
      name: schemas.name,
      email: schemas.email,
      password: schemas.password,
    }),
    
    login: z.object({
      email: schemas.email,
      password: z.string().min(1, 'Le mot de passe est requis'),
    }),
    
    update: z.object({
      name: schemas.name.optional(),
      email: schemas.email.optional(),
      currentPassword: z.string().optional(),
      newPassword: schemas.password.optional(),
    }).refine(
      (data) => !data.newPassword || data.currentPassword,
      'Le mot de passe actuel est requis pour modifier le mot de passe'
    ),
  },
};

// Type inference for schemas
export type ContractCreateInput = z.infer<typeof schemas.contract.create>;
export type ContractSignInput = z.infer<typeof schemas.contract.sign>;
export type UserRegisterInput = z.infer<typeof schemas.user.register>;
export type UserLoginInput = z.infer<typeof schemas.user.login>;
export type UserUpdateInput = z.infer<typeof schemas.user.update>;

// Helper function to format validation errors for the API response
export const formatValidationErrors = (error: z.ZodError) => {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    return { ...acc, [path]: err.message };
  }, {} as Record<string, string>);
};
