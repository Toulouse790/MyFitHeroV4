import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export type FormData<T> = {
  [K in keyof T]: FormField;
};

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface UseFormReturn<T> {
  values: T;
  formData: FormData<T>;
  errors: { [K in keyof T]?: string };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: (field: keyof T, value: string) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export const useForm = <T extends Record<string, string>>(
  options: UseFormOptions<T>
): UseFormReturn<T> => {
  const { initialValues, validationRules = {}, onSubmit } = options;

  // Initialize form data with field metadata
  const initializeFormData = (): FormData<T> => {
    const formData = {} as FormData<T>;
    Object.keys(initialValues).forEach((key) => {
      const field = key as keyof T;
      formData[field] = {
        value: initialValues[field],
        touched: false
      };
    });
    return formData;
  };

  const [formData, setFormData] = useState<FormData<T>>(initializeFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract current values
  const values = Object.keys(formData).reduce((acc, key) => {
    const field = key as keyof T;
    acc[field] = formData[field].value as T[keyof T];
    return acc;
  }, {} as T);

  // Extract current errors
  const errors = Object.keys(formData).reduce((acc, key) => {
    const field = key as keyof T;
    if (formData[field].error) {
      acc[field] = formData[field].error;
    }
    return acc;
  }, {} as { [K in keyof T]?: string });

  // Check if form is valid (no errors)
  const isValid = Object.values(errors).every(error => !error);

  // Check if form is dirty (any field has been touched)
  const isDirty = Object.values(formData).some(field => field.touched);

  // Validate a single field
  const validateField = useCallback((field: keyof T): boolean => {
    const value = formData[field].value;
    const rules = validationRules[field];
    
    if (!rules) return true;

    let error: string | undefined;

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      error = 'This field is required';
    }
    // Min length validation
    else if (rules.minLength && value.length < rules.minLength) {
      error = `Minimum length is ${rules.minLength} characters`;
    }
    // Max length validation
    else if (rules.maxLength && value.length > rules.maxLength) {
      error = `Maximum length is ${rules.maxLength} characters`;
    }
    // Pattern validation
    else if (rules.pattern && !rules.pattern.test(value)) {
      error = 'Invalid format';
    }
    // Custom validation
    else if (rules.custom) {
      error = rules.custom(value);
    }

    // Update field error
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error
      }
    }));

    return !error;
  }, [formData, validationRules]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    
    Object.keys(formData).forEach((key) => {
      const field = key as keyof T;
      const fieldValid = validateField(field);
      if (!fieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [formData, validateField]);

  // Handle input change
  const handleChange = useCallback((field: keyof T) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true,
        error: undefined // Clear error on change
      }
    }));
  }, []);

  // Handle input blur (validation trigger)
  const handleBlur = useCallback((field: keyof T) => () => {
    validateField(field);
  }, [validateField]);

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true
      }
    }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error
      }
    }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((field: keyof T) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: undefined
      }
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!validateForm() || !onSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, values]);

  // Reset form to initial state
  const reset = useCallback(() => {
    setFormData(initializeFormData());
    setIsSubmitting(false);
  }, []);

  return {
    values,
    formData,
    errors,
    isValid,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    clearFieldError,
    validateField,
    validateForm,
    handleSubmit,
    reset
  };
};

export default useForm;
