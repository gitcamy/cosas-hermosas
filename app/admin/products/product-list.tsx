import Link from 'next/link';
import { db } from '@/lib/db';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/store/utils';

export async function ProductList({ products }: { products: any[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No products yet.</p>
        <Button asChild>
          <Link href="/admin/products/new">Add Your First Product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const firstImage = product.images[0];
        const minPrice = Math.min(
          ...product.variants.map((v: any) => parseFloat(v.price.toString()))
        );

        return (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {firstImage ? (
              <div className="aspect-square relative bg-muted">
                <Image
                  src={firstImage.url}
                  alt={firstImage.altText || product.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-1">{product.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {product.collection?.title || 'Uncategorized'}
              </p>
              <p className="font-semibold">{formatPrice(minPrice.toString(), product.currencyCode)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

