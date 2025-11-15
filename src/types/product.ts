// src/types/product.ts

export interface Product {
  // ID fields
  _id: string;
  id?: string; // For DRF-based REST API compatibility

  // Core fields
  product_name: string;
  category: string;
  description: string;
  price: number;

  // Ingredient-related
  ingredients: string[];
  benefits: string[];

  // Optional or sometimes nullable fields
  scent_profile?: string | null;
  weight?: number | null;
  dimensions?: string | null;

  // Inventory/stock
  availability: boolean;
  inventory: number;
  reserved_inventory: number;

  // Images
  images?: string[]; // Array of image paths/URLs
  image?: string;    // Sometimes a single image is used

  // Product variations/variants (can be empty arrays or omitted)
  variations?: Record<string, any>[];
  variants?: Record<string, any>[];

  // Optional tags
  tags?: string[];

  // Ratings (may be readonly/calculated by backend)
  average_rating?: number;
  review_count?: number;
}
