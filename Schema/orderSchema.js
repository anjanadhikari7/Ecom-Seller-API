import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    productName: {
      type: String,
    },
    productId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
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
      type: date,
      required: true,
    },
    price: {
      type: number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: number,
      required: true,
    },
    status: {
      type: string,
      default: "pending",
    },

    thumbnail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
