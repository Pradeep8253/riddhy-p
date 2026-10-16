import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24)
});

export const pincodeSchema = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian pincode.');

export const checkoutQuoteSchema = z.object({
  items: z.array(z.object({
    sku: z.string().min(1),
    qty: z.number().int().min(1).max(99)
  })).min(1).max(40),
  pincode: pincodeSchema.optional(),
  coupon: z.string().max(32).optional()
});

export const addressSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6-9.'),
  line1: z.string().min(5).max(180),
  line2: z.string().max(180).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: pincodeSchema,
  landmark: z.string().max(100).optional()
});

export const claimSchema = z.object({
  productRegistrationId: z.string().min(1),
  issue: z.string().min(10).max(2000),
  preferredContact: z.enum(['phone', 'email']).default('phone')
});

export const consultationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6-9.'),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
  pincode: pincodeSchema,
  interests: z.array(z.enum(['furniture', 'appliances', 'full_home'])).min(1, 'Select at least one area of interest.'),
  roomType: z.enum(['living', 'bedroom', 'kitchen', 'dining', 'study', 'whole_home']),
  budgetRange: z.string().max(60).optional(),
  timeline: z.enum(['week', 'month', 'ahead']).default('month'),
  message: z.string().max(1500).optional().default(''),
  mode: z.enum(['phone', 'video', 'showroom', 'home']).default('phone'),
  preferredDate: z.string().min(10, 'Please select a preferred date.'),
  timeWindow: z.enum(['morning', 'afternoon', 'evening']),
  altDate: z.string().optional().or(z.literal('')),
  altTimeWindow: z.enum(['morning', 'afternoon', 'evening']).optional().or(z.literal('')),
  language: z.enum(['en', 'hi']).default('en'),
  whatsappOptIn: z.boolean().default(false),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please provide consent to proceed with consultation scheduling.' })
  }),
  honeypot: z.string().optional(),
  submitDuration: z.number().optional(),
  attachments: z.array(z.string().url()).optional().default([])
});

export const contactEnquirySchema = z.object({
  inquiryType: z.enum(['bulk', 'on_demand', 'assistance', 'general', 'contact']).default('general'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6-9.'),
  topic: z.string().optional().default('other'),
  subject: z.string().max(150).optional().default(''),
  orderNumber: z.string().max(60).optional().default(''),
  message: z.string().trim().max(3000).optional().default(''),

  // Bulk & on-demand fields
  productName: z.string().max(120).optional().default(''),
  category: z.string().max(80).optional().default(''),
  quantity: z.coerce.number().optional(),
  budgetRange: z.string().max(80).optional().default(''),
  deliveryLocation: z.string().max(120).optional().default(''),
  preferredDate: z.string().max(40).optional().default(''),
  specifications: z.string().max(1500).optional().default(''),
  intendedUse: z.string().max(100).optional().default(''),
  preferredContactMethod: z.enum(['phone', 'whatsapp', 'email', 'showroom', 'home']).default('phone'),
  referenceImage: z.string().optional().default(''),

  consent: z.boolean().optional(),
  honeypot: z.string().optional()
});

