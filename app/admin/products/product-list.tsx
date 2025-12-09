import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/store/utils';

export function ProductList({ products }: { products: any[] }) {
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
        return (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {product.imageUrl ? (
              <div className="aspect-square relative bg-muted">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
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
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <p className="font-semibold">{formatPrice(product.price.toString(), 'USD')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Stock: {product.stock}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

