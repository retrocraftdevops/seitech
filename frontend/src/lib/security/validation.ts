/**
 * Agent 7: Security - Input Validation
 */

import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+44|0)[0-9]{10}$/).optional(),
  message: z.string().min(10).max(1000),
});

export const enrollmentSchema = z.object({
  courseId: z.number().positive(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type EnrollmentData = z.infer<typeof enrollmentSchema>;
