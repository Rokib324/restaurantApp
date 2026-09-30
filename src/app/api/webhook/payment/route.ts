import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { OrderStatus } from '@/models/Order';

// Simulated payment webhook handler for bKash/Nagad callbacks
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { orderId, transactionId, status, provider } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'orderId and status are required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update payment status based on webhook payload
    if (status === 'SUCCESS') {
      order.paymentStatus = 'paid';
      // Progress order status to 'preparing' once payment confirmed
      if (order.orderStatus === 'received') {
        order.orderStatus = 'preparing';
      }
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      order.paymentStatus = 'failed';
    }

    await order.save();

    console.log(
      `Payment webhook: Provider=${provider}, TxID=${transactionId}, OrderID=${orderId}, Status=${status}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook processed',
        data: {
          orderId,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/webhook/payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Simulate auto-progression of order status for demo
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { orderId, orderStatus } = body;

    const validStatuses: OrderStatus[] = ['received', 'preparing', 'packaging', 'delivered'];

    if (!orderId || !validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid orderId or orderStatus' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/webhook/payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Status update failed' },
      { status: 500 }
    );
  }
}
