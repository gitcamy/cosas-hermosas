import { unstable_cache } from 'next/cache';
import { TAGS } from '@/lib/constants';
import { db } from '@/lib/db';
import type {
  Product,
  Collection,
  ProductSortKey,
  ProductCollectionSortKey,
  Money,
  Image,
  ProductVariant,
} from '@/lib/store/types';

// Helper to transform database price to Money type
function toMoney(amount: number | string | any, currencyCode = 'USD'): Money {
  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount) 
    : typeof amount === 'number' 
    ? amount 
    : parseFloat(String(amount));
  return {
    amount: numAmount.toFixed(2),
    currencyCode,
  };
}

// Transform database product to Product type (simplified schema)
function transformProduct(dbProduct: any): Product {
  // Create a single image from imageUrl if it exists
  const featuredImage: Image = dbProduct.imageUrl
    ? {
        url: dbProduct.imageUrl,
        altText: dbProduct.name || '',
        height: 600,
        width: 600,
      }
    : { url: '', altText: '', height: 0, width: 0 };

  // Create a single variant from the product (simplified - no variants in schema)
  const price = toMoney(dbProduct.price, 'USD');
  const variant: ProductVariant = {
    id: dbProduct.id,
    title: 'Default',
    availableForSale: (dbProduct.stock ?? 0) > 0,
    price,
    selectedOptions: [],
  };

  return {
    id: dbProduct.id,
    title: dbProduct.name || '',
    handle: dbProduct.id, // Use ID as handle since handle doesn't exist in schema
    categoryId: undefined,
    description: dbProduct.description || '',
    descriptionHtml: dbProduct.description || '',
    featuredImage,
    currencyCode: 'USD',
    priceRange: {
      minVariantPrice: price,
      maxVariantPrice: price,
    },
    compareAtPrice: undefined,
    seo: {
      title: dbProduct.name || '',
      description: dbProduct.description || '',
    },
    options: [],
    tags: [],
    variants: [variant],
    images: featuredImage.url ? [featuredImage] : [],
    availableForSale: (dbProduct.stock ?? 0) > 0,
  };
}

// Transform database collection to Collection type
function transformCollection(dbCollection: any): Collection {
  return {
    handle: dbCollection.handle,
    title: dbCollection.title,
    description: dbCollection.description || '',
    seo: {
      title: dbCollection.title,
      description: dbCollection.description || '',
    },
    parentCategoryTree: [],
    updatedAt: dbCollection.updatedAt.toISOString(),
    path: `/shop/${dbCollection.handle}`,
  };
}

// Get sort order for Prisma (simplified schema)
function getSortOrder(sortKey: ProductSortKey | ProductCollectionSortKey, reverse = false) {
  const order = reverse ? 'desc' : 'asc';
  
  switch (sortKey) {
    case 'PRICE':
      return { price: order };
    case 'CREATED_AT':
    case 'CREATED':
      return { createdAt: order };
    case 'TITLE':
      return { name: order };
    case 'UPDATED_AT':
      return { createdAt: order }; // No updatedAt in schema, use createdAt
    case 'BEST_SELLING':
      return { createdAt: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

export const getCollections = unstable_cache(
  async (): Promise<Collection[]> => {
    // Collections are not in the current database schema
    // Return empty array to prevent errors
    return [];
  },
  ['collections'],
  { tags: [TAGS.collections], revalidate: 60 }
);

export const getCollection = unstable_cache(
  async (handle: string): Promise<Collection | null> => {
    // Collections are not in the current database schema
    return null;
  },
  ['collection'],
  { tags: [TAGS.collections], revalidate: 60 }
);

export const getProduct = unstable_cache(
  async (handle: string): Promise<Product | null> => {
    try {
      // Since handle doesn't exist, we'll use id instead
      const dbProduct = await db.product.findUnique({
        where: { id: handle },
      });

      if (!dbProduct) return null;
      return transformProduct(dbProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },
  ['product'],
  { tags: [TAGS.products], revalidate: 60 }
);

async function getProductsInternal(params: {
  limit?: number;
  sortKey?: ProductSortKey;
  reverse?: boolean;
  query?: string;
}): Promise<Product[]> {
  try {
    const limit = params.limit || 24;
    const where: any = {};

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    const orderBy = getSortOrder(params.sortKey || 'CREATED_AT', params.reverse);

    const dbProducts = await db.product.findMany({
      where,
      take: limit,
      orderBy,
    });

    return dbProducts.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export const getProducts = unstable_cache(
  getProductsInternal,
  ['products'],
  { tags: [TAGS.products], revalidate: 60 }
);

export const getCollectionProducts = unstable_cache(
  async (params: {
    collection: string;
    limit?: number;
    sortKey?: ProductCollectionSortKey;
    reverse?: boolean;
    query?: string;
  }): Promise<Product[]> => {
    // Since collections don't exist, just return all products
    // You can filter by collection later if you add it to the schema
    // Map ProductCollectionSortKey to ProductSortKey
    const sortKeyMap: Record<ProductCollectionSortKey, ProductSortKey> = {
      'BEST_SELLING': 'BEST_SELLING',
      'COLLECTION_DEFAULT': 'CREATED_AT',
      'CREATED': 'CREATED_AT',
      'ID': 'ID',
      'MANUAL': 'CREATED_AT',
      'PRICE': 'PRICE',
      'RELEVANCE': 'RELEVANCE',
      'TITLE': 'TITLE',
    };
    
    return getProductsInternal({
      limit: params.limit,
      sortKey: params.sortKey ? sortKeyMap[params.sortKey] : undefined,
      reverse: params.reverse,
      query: params.query,
    });
  },
  ['collection-products'],
  { tags: [TAGS.collectionProducts], revalidate: 60 }
);
