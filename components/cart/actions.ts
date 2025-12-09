'use server';

import { TAGS } from '@/lib/constants';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import type { Cart, CartItem, Money } from '@/lib/store/types';

// Helper to transform database cart to Cart type
function adaptCartLine(dbItem: any): CartItem {
  const variant = dbItem.variant;
  const product = variant.product;
  const firstImage = product.images?.[0];

  return {
    id: dbItem.id,
    quantity: dbItem.quantity,
    cost: {
      totalAmount: {
        amount: (parseFloat(variant.price.toString()) * dbItem.quantity).toFixed(2),
        currencyCode: product.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions.map((opt: any) => ({
        name: opt.name,
        value: opt.value,
      })),
      product: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        categoryId: product.productType || product.collection?.title,
        description: product.description || '',
        descriptionHtml: product.descriptionHtml || '',
        featuredImage: firstImage
          ? {
              url: firstImage.url,
              altText: firstImage.altText || product.title,
              height: firstImage.height,
              width: firstImage.width,
              thumbhash: firstImage.thumbhash || undefined,
            }
          : { url: '', altText: '', height: 0, width: 0 },
        currencyCode: product.currencyCode,
        priceRange: {
          minVariantPrice: {
            amount: variant.price.toString(),
            currencyCode: product.currencyCode,
          },
          maxVariantPrice: {
            amount: variant.price.toString(),
            currencyCode: product.currencyCode,
          },
        },
        compareAtPrice: variant.compareAtPrice
          ? {
              amount: variant.compareAtPrice.toString(),
              currencyCode: product.currencyCode,
            }
          : undefined,
        seo: { title: product.title, description: product.description || '' },
        options: product.options.map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          values: opt.values.map((val: any) => ({
            id: val.id,
            name: val.value,
          })),
        })),
        tags: product.tags || [],
        variants: product.variants.map((v: any) => ({
          id: v.id,
          title: v.title,
          availableForSale: v.availableForSale,
          price: {
            amount: v.price.toString(),
            currencyCode: product.currencyCode,
          },
          selectedOptions: v.selectedOptions.map((opt: any) => ({
            name: opt.name,
            value: opt.value,
          })),
        })),
        images: product.images.map((img: any) => ({
          url: img.url,
          altText: img.altText || product.title,
          height: img.height,
          width: img.width,
          thumbhash: img.thumbhash || undefined,
        })),
        availableForSale: product.availableForSale,
      },
    },
  } satisfies CartItem;
}

function adaptCart(dbCart: any): Cart | null {
  if (!dbCart) return null;

  const lines = dbCart.items.map(adaptCartLine);
  const subtotal = lines.reduce(
    (sum: number, line: CartItem) => sum + parseFloat(line.cost.totalAmount.amount),
    0
  );

  return {
    id: dbCart.id,
    checkoutUrl: `/checkout?cart=${dbCart.id}`, // Will be replaced with Stripe checkout
    cost: {
      subtotalAmount: {
        amount: subtotal.toFixed(2),
        currencyCode: 'USD',
      },
      totalAmount: {
        amount: subtotal.toFixed(2), // Will add tax/shipping later
        currencyCode: 'USD',
      },
      totalTaxAmount: {
        amount: '0.00',
        currencyCode: 'USD',
      },
    },
    totalQuantity: lines.reduce((sum: number, line: CartItem) => sum + line.quantity, 0),
    lines,
  } satisfies Cart;
}

async function getOrCreateCartId(): Promise<string> {
  let cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) {
    const newCart = await db.cart.create({
      data: {},
    });
    cartId = newCart.id;
    (await cookies()).set('cartId', cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return cartId;
}

// Add item server action: returns adapted Cart
export async function addItem(variantId: string | undefined): Promise<Cart | null> {
  if (!variantId) return null;
  try {
    const cartId = await getOrCreateCartId();
    
    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId,
        variantId,
      },
    });

    if (existingItem) {
      // Update quantity
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
    } else {
      // Create new item
      await db.cartItem.create({
        data: {
          cartId,
          variantId,
          quantity: 1,
        },
      });
    }

    const fresh = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { order: 'asc' } },
                    variants: {
                      include: {
                        selectedOptions: true,
                      },
                    },
                    options: {
                      include: {
                        values: true,
                      },
                    },
                    collection: true,
                  },
                },
                selectedOptions: true,
              },
            },
          },
        },
      },
    });

    revalidateTag(TAGS.cart);
    return adaptCart(fresh);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return null;
  }
}

// Update item server action (quantity 0 removes): returns adapted Cart
export async function updateItem({ lineId, quantity }: { lineId: string; quantity: number }): Promise<Cart | null> {
  try {
    const cartId = (await cookies()).get('cartId')?.value;
    if (!cartId) return null;

    if (quantity === 0) {
      await db.cartItem.delete({
        where: { id: lineId },
      });
    } else {
      await db.cartItem.update({
        where: { id: lineId },
        data: { quantity },
      });
    }

    const fresh = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { order: 'asc' } },
                    variants: {
                      include: {
                        selectedOptions: true,
                      },
                    },
                    options: {
                      include: {
                        values: true,
                      },
                    },
                    collection: true,
                  },
                },
                selectedOptions: true,
              },
            },
          },
        },
      },
    });

    revalidateTag(TAGS.cart);
    return adaptCart(fresh);
  } catch (error) {
    console.error('Error updating item:', error);
    return null;
  }
}

export async function createCartAndSetCookie() {
  try {
    const newCart = await db.cart.create({
      data: {},
    });

    (await cookies()).set('cartId', newCart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return newCart;
  } catch (error) {
    console.error('Error creating cart:', error);
    return null;
  }
}

export async function getCart(): Promise<Cart | null> {
  try {
    const cartId = (await cookies()).get('cartId')?.value;

    if (!cartId) {
      return null;
    }

    const dbCart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { order: 'asc' } },
                    variants: {
                      include: {
                        selectedOptions: true,
                      },
                    },
                    options: {
                      include: {
                        values: true,
                      },
                    },
                    collection: true,
                  },
                },
                selectedOptions: true,
              },
            },
          },
        },
      },
    });

    return adaptCart(dbCart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}
