import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const cartId = session.metadata?.cartId;

    if (!cartId) {
      console.error('No cartId in session metadata');
      return NextResponse.json({ error: 'No cartId found' }, { status: 400 });
    }

    // Get cart with items
    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      console.error('Cart not found:', cartId);
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + parseFloat(item.variant.price.toString()) * item.quantity,
      0
    );

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Create customer if email provided
    let customerId: string | undefined;
    if (session.customer_email) {
      const customer = await db.customer.upsert({
        where: { email: session.customer_email },
        update: {},
        create: {
          email: session.customer_email,
          firstName: session.customer_details?.name?.split(' ')[0],
          lastName: session.customer_details?.name?.split(' ').slice(1).join(' '),
        },
      });
      customerId = customer.id;
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        status: 'processing',
        totalAmount: subtotal,
        subtotalAmount: subtotal,
        taxAmount: 0,
        shippingAmount: 0,
        currencyCode: 'USD',
        stripePaymentIntentId: session.payment_intent as string | undefined,
        stripeCheckoutSessionId: session.id,
        customerId,
        items: {
          create: cart.items.map((item) => ({
            quantity: item.quantity,
            price: item.variant.price,
            title: item.variant.product.title,
            variantTitle: item.variant.title !== 'Default Title' ? item.variant.title : null,
            variantId: item.variantId,
            productId: item.variant.productId,
            productTitle: item.variant.product.title,
          })),
        },
      },
    });

    // Clear cart
    await db.cartItem.deleteMany({
      where: { cartId },
    });

    console.log('Order created:', order.orderNumber);
  }

  return NextResponse.json({ received: true });
}

