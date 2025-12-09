import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      handle,
      description,
      descriptionHtml,
      productType,
      collectionId,
      currencyCode = 'USD',
      availableForSale = true,
      images = [],
      variants = [],
      options = [],
      tags = [],
    } = body;

    // Create product
    const product = await db.product.create({
      data: {
        title,
        handle: handle || title.toLowerCase().replace(/\s+/g, '-'),
        description: description || '',
        descriptionHtml: descriptionHtml || description || '',
        productType,
        collectionId: collectionId || null,
        currencyCode,
        availableForSale,
        tags,
        images: {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            altText: img.altText || title,
            width: img.width || 600,
            height: img.height || 600,
            thumbhash: img.thumbhash || null,
            order: index,
          })),
        },
        options: {
          create: options.map((opt: any) => ({
            name: opt.name,
            values: {
              create: opt.values.map((val: string) => ({
                value: val,
              })),
            },
          })),
        },
        variants: {
          create: variants.map((variant: any) => ({
            title: variant.title || 'Default Title',
            price: variant.price,
            compareAtPrice: variant.compareAtPrice || null,
            sku: variant.sku || null,
            availableForSale: variant.availableForSale !== false,
            selectedOptions: {
              create: (variant.selectedOptions || []).map((opt: any) => ({
                name: opt.name,
                value: opt.value,
              })),
            },
          })),
        },
      },
      include: {
        images: true,
        variants: true,
        options: {
          include: {
            values: true,
          },
        },
        collection: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        collection: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

