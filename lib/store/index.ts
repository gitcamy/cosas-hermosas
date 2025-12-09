// Re-export database functions
import {
  getCollections,
  getCollection,
  getProduct,
  getProducts,
  getCollectionProducts,
} from '@/lib/products';
import type {
  Product,
  Collection,
  ProductCollectionSortKey,
  ProductSortKey,
} from './types';

// Re-export for compatibility
export {
  getCollections,
  getCollection,
  getProduct,
  getProducts,
  getCollectionProducts,
};

export async function getCart() {
  try {
    const { getCart: getCartAction } = await import('@/components/cart/actions');
    return await getCartAction();
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

