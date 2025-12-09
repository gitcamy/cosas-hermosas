import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function OrderDetails({ sessionId }: { sessionId: string }) {
  const { db } = await import('@/lib/db');
  
  const order = await db.order.findFirst({
    where: {
      stripeCheckoutSessionId: sessionId,
    },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find your order. Please contact support if you have any questions.
        </p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order number is{' '}
          <span className="font-semibold">{order.orderNumber}</span>
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.title} {item.variantTitle && `- ${item.variantTitle}`} x {item.quantity}
              </span>
              <span>${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${parseFloat(order.subtotalAmount.toString()).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${parseFloat(order.totalAmount.toString()).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <PageLayout>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        {searchParams.session_id ? (
          <OrderDetails sessionId={searchParams.session_id} />
        ) : (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </Suspense>
    </PageLayout>
  );
}

