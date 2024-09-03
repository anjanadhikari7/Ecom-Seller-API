import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    productId: {
      type: String,

      required: true,
    },
    productName: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
