import { z } from 'zod';

export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(48).default(24) });
export const pincodeSchema = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian pincode.');
export const checkoutQuoteSchema = z.object({ items: z.array(z.object({ sku: z.string().min(1), qty: z.number().int().min(1).max(99) })).min(1).max(40), pincode: pincodeSchema.optional(), coupon: z.string().max(32).optional() });
export const addressSchema = z.object({ name: z.string().min(2).max(100), phone: z.string().regex(/^[6-9]\d{9}$/), line1: z.string().min(5).max(180), line2: z.string().max(180).optional(), city: z.string().min(2).max(80), state: z.string().min(2).max(80), pincode: pincodeSchema, landmark: z.string().max(100).optional() });
export const claimSchema = z.object({ productRegistrationId: z.string().min(1), issue: z.string().min(10).max(2000), preferredContact: z.enum(['phone','email']).default('phone') });
