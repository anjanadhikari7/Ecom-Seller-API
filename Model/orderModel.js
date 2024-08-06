import orderSchema from "../Schema/orderSchema";

// Create an order
export const createOrder = (orderObj) => {
  return orderSchema(orderObj).save;
};

// Get all orders

export const getOrders = () => {
  return orderSchema.find();
};
