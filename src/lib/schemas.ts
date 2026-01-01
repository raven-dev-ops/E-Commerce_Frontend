import { z } from 'zod';

const idSchema = z.union([z.string(), z.number()]).transform((val) => String(val));

export const productSchema = z
  .object({
    _id: idSchema,
    id: z.string().optional(),
    product_name: z.string(),
    category: z.string().optional().default(''),
    description: z.string().optional().default(''),
    price: z.coerce.number(),
    ingredients: z.array(z.string()).optional().default([]),
    benefits: z.array(z.string()).optional().default([]),
    scent_profile: z.string().nullable().optional(),
    weight: z.number().nullable().optional(),
    dimensions: z.string().nullable().optional(),
    availability: z.boolean().optional().default(true),
    inventory: z.number().optional().default(0),
    reserved_inventory: z.number().optional().default(0),
    images: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
    variations: z.array(z.record(z.string(), z.unknown())).optional(),
    variants: z.array(z.record(z.string(), z.unknown())).optional(),
    tags: z.array(z.string()).optional(),
    average_rating: z.number().optional(),
    review_count: z.number().optional(),
  })
  .passthrough();

export const cartItemSchema = z
  .object({
    id: idSchema,
    product_id: idSchema,
    product_name: z.string().optional().default(''),
    quantity: z.coerce.number(),
    price: z.coerce.number().optional().default(0),
  })
  .passthrough();

export const cartSchema = z
  .object({
    id: idSchema,
    items: z.array(cartItemSchema),
    total_price: z.union([z.string(), z.number()]).transform((val) => String(val)),
  })
  .passthrough();

export const orderItemSchema = z
  .object({
    id: idSchema,
    product_name: z.string(),
    quantity: z.coerce.number(),
    price: z.coerce.number(),
  })
  .passthrough();

export const orderSchema = z
  .object({
    id: idSchema,
    status: z.string(),
    total: z.coerce.number(),
    created_at: z.string().optional(),
    items: z.array(orderItemSchema).optional().default([]),
  })
  .passthrough();

export const addressSchema = z
  .object({
    id: idSchema.optional(),
    line1: z.string().optional().default(''),
    line2: z.string().optional().nullable(),
    city: z.string().optional().default(''),
    state: z.string().optional().default(''),
    postal_code: z.string().optional().default(''),
    country: z.string().optional().default(''),
    is_default_shipping: z.boolean().optional().default(false),
    is_default_billing: z.boolean().optional().default(false),
  })
  .passthrough();

export const profileSchema = z
  .object({
    email: z.string(),
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
  })
  .passthrough();

export const createOrderResponseSchema = z
  .object({
    id: idSchema.optional(),
    order_id: idSchema.optional(),
    order: orderSchema.optional(),
    payment_intent_client_secret: z.string().optional(),
    client_secret: z.string().optional(),
    requires_action: z.boolean().optional(),
  })
  .passthrough();

export const parseWithSchema = <T>(schema: z.ZodType<T>, data: unknown, label: string): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid ${label} response`);
  }
  return result.data;
};
