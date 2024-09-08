import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrders,
  updateOrder,
} from "../Model/orderModel.js";
import { adminAuth } from "../middleware/authMiddleware/authMiddleware.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/responseHelper.js";

const orderRouter = express.Router();
// GET ALL Orderss
orderRouter.get("/", adminAuth, async (req, res) => {
  try {
    const orders = await getOrders();

    orders?.length
      ? buildSuccessResponse(res, orders, "Orders")
      : buildErrorResponse(res, "No orders available");
  } catch (error) {
    buildErrorResponse(res, "Could not fetch data");
  }
});
export default orderRouter;

// Create order

orderRouter.post("/", async (req, res) => {
  try {
    const order = await createOrder(req.body);
    return order?._id
      ? buildSuccessResponse(res, order, "Order created successfully")
      : buildErrorResponse(res, error.message);
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

// Update order

orderRouter.patch("/", adminAuth, async (req, res) => {
  try {
    const { _id, ...orderData } = req.body;
    console.log(orderData);

    const updatedOrder = await updateOrder({ _id }, orderData);

    if (!updatedOrder?._id) {
      return buildErrorResponse(res, "Failed to update Order");
    }
    return buildSuccessResponse(
      res,
      updatedOrder,
      "Order updated Successfully!"
    );
  } catch (error) {
    return buildErrorResponse(res, "Failed to update order");
  }
});

// Delete order

orderRouter.delete("/", adminAuth, async (req, res) => {
  try {
    const { _id } = req.body;

    const result = await deleteOrder(_id);
    if (result?._id) {
      return buildSuccessResponse(res, {}, "Order successfully deleted");
    }
    buildErrorResponse(res, "Could not delete Order");
  } catch (error) {
    buildErrorResponse(res, "Could not delete Order");
  }
});
