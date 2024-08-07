import express from "express";
import { createOrder, getOrders } from "../Model/orderModel.js";
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
      : buildErrorResponse(res, "Could not create order.");
  } catch (error) {
    buildErrorResponse(res, "Could not create order.");
  }
});
