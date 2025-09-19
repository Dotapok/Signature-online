import { useState, useCallback, useEffect, useRef } from 'react';
import { z, ZodTypeAny, ZodError } from 'zod';
import { useToast } from './useToast';

type FormErrors<T> = Partial<Record<keyof T, string>>;
type FormTouched<T> = Partial<Record<keyof T, boolean>>;
type FormValues = Record<string, any>;

interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  enableReinitialize?: boolean;
}

interface UseFormReturn<T extends FormValues> {
  // Form state
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isValidating: boolean;
  submitCount: number;
  
  // Form actions
  handleChange: (
    field: keyof T | string,
    value?: any,
    shouldValidate?: boolean
  ) => void;
  handleBlur: (field: keyof T | string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: <K extends keyof T>(field: K, value: T[K], shouldValidate?: boolean) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean, shouldValidate?: boolean) => void;
  setFieldError: (field: keyof T, message: string | undefined) => void;
  setValues: (values: Partial<T>, shouldValidate?: boolean) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setTouched: (touched: FormTouched<T>, shouldValidate?: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: (values?: Partial<T>) => void;
  validateForm: (valuesToValidate?: T) => Promise<FormErrors<T>>;
  
  // Field props
  getFieldProps: (field: keyof T) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
    error: string | undefined;
    touched: boolean;
  };
}

export function useForm<T extends FormValues>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  enableReinitialize = false,
}: UseFormOptions<T>): UseFormReturn<T> {
  const { error: showError } = useToast();
  
  // State
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  // Refs
  const validationSchemaRef = useRef(validationSchema);
  const initialValuesRef = useRef(initialValues);
  
  // Update refs when props change
  useEffect(() => {
    validationSchemaRef.current = validationSchema;
  }, [validationSchema]);
  
  // Handle initial validation
  useEffect(() => {
    if (validateOnMount && validationSchemaRef.current) {
      validateForm(initialValues);
    }
    setIsMounted(true);
  }, []);
  
  // Handle reinitialization
  useEffect(() => {
    if (isMounted && enableReinitialize) {
      resetForm(initialValues);
    }
  }, [initialValues, enableReinitialize, isMounted]);
  
  // Validate form values against the schema
  const validateForm = useCallback(async (valuesToValidate: T = values): Promise<FormErrors<T>> => {
    if (!validationSchemaRef.current) return {};
    
    setIsValidating(true);
    
    try {
      await validationSchemaRef.current.parseAsync(valuesToValidate);
      setErrors({});
      setIsValidating(false);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors = error.errors.reduce<FormErrors<T>>((acc, curr) => {
          const key = curr.path[0] as keyof T;
          acc[key] = curr.message;
          return acc;
        }, {});
        
        setErrors(newErrors);
        setIsValidating(false);
        return newErrors;
      }
      
      setIsValidating(false);
      return {};
    }
  }, [values]);
  
  // Check if the form is valid
  const isValid = Object.keys(errors).length === 0 && Object.values(touched).some(Boolean);
  
  // Handle field change
  const handleChange = useCallback(
    (field: keyof T | string, value?: any, shouldValidate = validateOnChange) => {
      const fieldName = field as string;
      const newValues = { ...values, [fieldName]: value };
      
      setValues(newValues);
      
      if (shouldValidate) {
        validateForm(newValues);
      }
      
      // Mark field as touched
      setTouched(prev => ({ ...prev, [fieldName]: true }));
    },
    [values, validateOnChange, validateForm]
  );
  
  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T | string) => {
      const fieldName = field as string;
      
      // Mark field as touched
      setTouched(prev => ({
        ...prev,
        [fieldName]: true,
      }));
      
      // Validate field if needed
      if (validateOnBlur && validationSchemaRef.current) {
        validateForm(values);
      }
    },
    [values, validateOnBlur, validateForm]
  );
  
  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      setSubmitCount(prev => prev + 1);
      
      // Validate form
      const formErrors = await validateForm();
      
      if (Object.keys(formErrors).length > 0) {
        // Mark all fields as touched to show errors
        const allTouched = Object.keys(values).reduce<FormTouched<T>>((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {});
        
        setTouched(allTouched);
        return;
      }
      
      // Submit form
      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error: any) {
        console.error('Form submission error:', error);
        showError(error.message || 'An error occurred while submitting the form');
        
        // Handle API validation errors
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, values, validateForm, showError]
  );
  
  // Set field value
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K], shouldValidate = true) => {
      handleChange(field as string, value, shouldValidate);
    },
    [handleChange]
  );
  
  // Set field touched
  const setFieldTouched = useCallback(
    (field: keyof T, isTouched = true, shouldValidate = true) => {
      setTouched(prev => ({
        ...prev,
        [field as string]: isTouched,
      }));
      
      if (shouldValidate && validationSchemaRef.current) {
        validateForm(values);
      }
    },
    [values, validateForm]
  );
  
  // Set field error
  const setFieldError = useCallback((field: keyof T, message: string | undefined) => {
    setErrors(prev => ({
      ...prev,
      [field as string]: message,
    }));
  }, []);
  
  // Set multiple values
  const setFormValues = useCallback(
    (newValues: Partial<T>, shouldValidate = true) => {
      const mergedValues = { ...values, ...newValues };
      setValues(mergedValues);
      
      if (shouldValidate && validationSchemaRef.current) {
        validateForm(mergedValues);
      }
    },
    [values, validateForm]
  );
  
  // Reset form
  const resetForm = useCallback((newValues: Partial<T> = {}) => {
    const mergedValues = { ...initialValuesRef.current, ...newValues } as T;
    setValues(mergedValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
    
    if (validationSchemaRef.current) {
      validateForm(mergedValues);
    }
  }, [validateForm]);
  
  // Get field props for form inputs
  const getFieldProps = useCallback(
    (field: keyof T) => {
      const fieldName = field as string;
      const value = values[field];
      const error = errors[field];
      const isTouched = touched[field] || false;
      
      return {
        name: fieldName,
        value: value ?? '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          const newValue = e.target.type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked 
            : e.target.value;
          
          handleChange(field, newValue);
        },
        onBlur: () => handleBlur(field),
        error: isTouched ? error : undefined,
        touched: isTouched,
      };
    },
    [values, errors, touched, handleChange, handleBlur]
  );
  
  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isValidating,
    submitCount,
    
    // Form actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    setValues: setFormValues,
    setErrors,
    setTouched,
    setSubmitting: setIsSubmitting,
    resetForm,
    validateForm,
    
    // Field props
    getFieldProps,
  };
}

export default useForm;
