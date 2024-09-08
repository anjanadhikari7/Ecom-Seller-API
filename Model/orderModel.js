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

// Update User
export const updateOrder = (filter, updatedOrder) => {
  return orderSchema.findOneAndUpdate(filter, updatedOrder, {
    new: true,
  });
};

//Delete User

export const deleteOrder = (_id) => {
  return orderSchema.findByIdAndDelete(_id);
};
