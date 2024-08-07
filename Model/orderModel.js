import orderSchema from "../Schema/orderSchema.js";

// Create an order
export const createOrder = (orderObj) => {
  console.log(orderObj);
  return orderSchema(orderObj).save();
};

// Get all orders

export const getOrders = () => {
  return orderSchema.find();
};
