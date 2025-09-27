import { z } from 'zod';

// Security validation schemas
export const securitySchemas = {
  // User input validation
  userProfile: z.object({
    display_name: z.string()
      .trim()
      .min(1, 'Display name is required')
      .max(100, 'Display name must be less than 100 characters')
      .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Display name contains invalid characters'),
    
    bio: z.string()
      .trim()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
      
    avatar_url: z.string()
      .url('Invalid avatar URL')
      .optional()
      .nullable()
  }),

  // Emergency contact validation
  emergencyContact: z.object({
    name: z.string()
      .trim()
      .min(1, 'Contact name is required')
      .max(100, 'Name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters'),
    
    phone: z.string()
      .trim()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    
    relationship: z.enum(['family', 'friend', 'colleague', 'other'], {
      errorMap: () => ({ message: 'Invalid relationship type' })
    }),
    
    is_primary: z.boolean().optional()
  }),

  // Trip validation
  trip: z.object({
    title: z.string()
      .trim()
      .min(1, 'Trip title is required')
      .max(200, 'Title must be less than 200 characters'),
    
    destination: z.string()
      .trim()
      .min(1, 'Destination is required')
      .max(200, 'Destination must be less than 200 characters'),
    
    start_date: z.string().refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed >= new Date();
    }, 'Start date must be valid and in the future'),
    
    end_date: z.string().refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'End date must be valid'),
    
    budget: z.number()
      .min(0, 'Budget cannot be negative')
      .max(1000000, 'Budget exceeds maximum limit')
      .optional(),
    
    notes: z.string()
      .max(2000, 'Notes must be less than 2000 characters')
      .optional()
  }).refine((data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  }, {
    message: 'End date must be after start date',
    path: ['end_date']
  }),

  // Message validation for AI chat
  chatMessage: z.object({
    message: z.string()
      .trim()
      .min(1, 'Message cannot be empty')
      .max(1000, 'Message must be less than 1000 characters')
      .refine((msg) => {
        // Check for potential injection attempts
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /on\w+=/i,
          /<iframe/i,
          /<object/i,
          /<embed/i
        ];
        return !dangerousPatterns.some(pattern => pattern.test(msg));
      }, 'Message contains potentially unsafe content'),
      
    context: z.string().max(5000).optional()
  }),

  // Location sharing validation
  locationShare: z.object({
    latitude: z.number()
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude'),
    
    longitude: z.number()
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude'),
    
    accuracy: z.number().min(0).optional(),
    
    emergency: z.boolean().optional()
  }),

  // Booking validation
  booking: z.object({
    booking_type: z.enum(['flight', 'train', 'bus', 'hotel'], {
      errorMap: () => ({ message: 'Invalid booking type' })
    }),
    
    booking_reference: z.string()
      .trim()
      .min(1, 'Booking reference is required')
      .max(50, 'Booking reference too long')
      .regex(/^[A-Z0-9\-]+$/, 'Invalid booking reference format'),
    
    total_amount: z.number()
      .min(0, 'Amount cannot be negative')
      .max(100000, 'Amount exceeds maximum limit'),
    
    booking_details: z.record(z.any()).optional()
  })
};

// Content sanitization
export class ContentSanitizer {
  private static readonly ALLOWED_TAGS = ['b', 'i', 'u', 'br', 'p'];
  private static readonly DANGEROUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi
  ];

  static sanitizeHtml(input: string): string {
    if (!input) return '';
    
    // Remove dangerous patterns
    let sanitized = input;
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Remove all HTML tags except allowed ones
    sanitized = sanitized.replace(/<(?!\/?(?:b|i|u|br|p)\b)[^>]+>/gi, '');
    
    return sanitized.trim();
  }

  static sanitizeText(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/vbscript:/gi, '') // Remove vbscript protocol
      .trim();
  }

  static sanitizeUrl(url: string): string {
    if (!url) return '';
    
    // Only allow http, https, and mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    
    try {
      const parsedUrl = new URL(url);
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return '';
      }
      return url;
    } catch {
      return '';
    }
  }
}

// Rate limiting
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || [];
    
    // Filter requests within the current window
    const recentRequests = existingRequests.filter(time => time > windowStart);
    
    // Check if under the limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const existingRequests = this.requests.get(identifier) || [];
    const recentRequests = existingRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

// Input validation utilities
export class InputValidator {
  static validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    sanitize: boolean = true
  ): { success: true; data: T } | { success: false; errors: z.ZodError } {
    try {
      let processedData = data;
      
      if (sanitize && typeof data === 'object' && data !== null) {
        processedData = this.sanitizeObject(data as Record<string, any>);
      }
      
      const result = schema.parse(processedData);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  private static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = ContentSanitizer.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length < 255;
  }

  static isValidPhoneNumber(phone: string): boolean {
    // E.164 format validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static containsProfanity(text: string): boolean {
    // Basic profanity check - in production, use a proper service
    const profanityList = ['spam', 'scam', 'hack', 'virus'];
    const lowercaseText = text.toLowerCase();
    return profanityList.some(word => lowercaseText.includes(word));
  }
}

// Security headers validation
export const validateSecurityHeaders = () => {
  const warnings: string[] = [];
  
  // Check if running on HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    warnings.push('Application should be served over HTTPS');
  }
  
  // Check for CSP
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    warnings.push('Content Security Policy not found');
  }
  
  return {
    isSecure: warnings.length === 0,
    warnings
  };
};

// Create global rate limiter instances
export const globalRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
export const emergencyRateLimiter = new RateLimiter(5, 60000); // 5 emergency requests per minute
export const chatRateLimiter = new RateLimiter(20, 60000); // 20 chat messages per minute