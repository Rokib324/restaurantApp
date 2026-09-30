import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentMethod = 'bkash' | 'nagad' | 'cod' | 'whatsapp';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'received' | 'preparing' | 'packaging' | 'delivered';

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface ICustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface IOrder extends Document {
  customerDetails: ICustomerDetails;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    customerDetails: { type: CustomerDetailsSchema, required: true },
    items: { type: [OrderItemSchema], required: true, validate: [(v: IOrderItem[]) => v.length > 0, 'Order must have at least one item'] },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['bkash', 'nagad', 'cod', 'whatsapp'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['received', 'preparing', 'packaging', 'delivered'],
      default: 'received',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ 'customerDetails.phone': 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
