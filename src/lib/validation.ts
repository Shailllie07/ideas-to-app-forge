import { z } from 'zod';

// Authentication validation schemas
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field
      return /^\+?[1-9]\d{1,14}$/.test(val);
    }, { message: "Please enter a valid phone number with country code" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
    }),
});

export const phoneSignInSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code" }),
});

export const otpVerificationSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code" }),
  otp: z
    .string()
    .trim()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only numbers" }),
});

export const passwordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

// Profile validation schemas
export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, { message: "Display name is required" })
    .max(100, { message: "Display name must be less than 100 characters" })
    .optional(),
  phone_number: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code" })
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional(),
  avatar_url: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional(),
});

export const medicalProfileSchema = z.object({
  medical_allergies: z
    .array(z.string().trim().max(100))
    .max(10, { message: "Maximum 10 allergies allowed" })
    .optional(),
  medical_conditions: z
    .array(z.string().trim().max(100))
    .max(10, { message: "Maximum 10 conditions allowed" })
    .optional(),
  medical_medications: z
    .array(z.string().trim().max(100))
    .max(20, { message: "Maximum 20 medications allowed" })
    .optional(),
  blood_type: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
      errorMap: () => ({ message: "Please select a valid blood type" })
    })
    .optional(),
  emergency_notes: z
    .string()
    .trim()
    .max(1000, { message: "Emergency notes must be less than 1000 characters" })
    .optional(),
});

export const emergencyContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" }),
  phone_number: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional(),
  relationship: z
    .string()
    .trim()
    .min(1, { message: "Relationship is required" })
    .max(50, { message: "Relationship must be less than 50 characters" }),
  is_primary: z.boolean().optional(),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional(),
});

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Security helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const isStrongPassword = (password: string): boolean => {
  return signUpSchema.shape.password.safeParse(password).success;
};