import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface StorefrontProductResponse {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  selling_price: number;
  image_url: string | null;
  category_id: string | null;
  category_name: string | null;
  brand_id: string | null;
  brand_name: string | null;
  available_quantity: number;
  is_active: boolean;
}

export interface StorefrontCategoryResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface StorefrontBrandResponse {
  id: string;
  name: string;
  description: string | null;
}

export const useStorefrontProducts = () => {
  return useQuery({
    queryKey: ['storefront_products'],
    queryFn: async () => {
      return await apiClient.get<StorefrontProductResponse[]>('/api/v1/storefront/products');
    },
  });
};

export const useStorefrontCategories = () => {
  return useQuery({
    queryKey: ['storefront_categories'],
    queryFn: async () => {
      return await apiClient.get<StorefrontCategoryResponse[]>('/api/v1/storefront/categories');
    },
  });
};

export const useStorefrontBrands = () => {
  return useQuery({
    queryKey: ['storefront_brands'],
    queryFn: async () => {
      return await apiClient.get<StorefrontBrandResponse[]>('/api/v1/storefront/brands');
    },
  });
};
