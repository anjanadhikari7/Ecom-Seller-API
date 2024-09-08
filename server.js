import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import userRouter from "./Routers/userRouter.js";
import categoryRouter from "./Routers/categoryRouter.js";

import { connectToMongoDb } from "./config/dbConfig.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to Database
connectToMongoDb();

// Serve Images to Client
import path from "path";
import productRouter from "./Routers/productRouter.js";
import orderRouter from "./Routers/orderRouter.js";

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/public")));

// Routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);

//STRIPE Integration

const stripe = new Stripe(process.env.STRIPE_API_KEY);
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "aud",
      payment_method: "pm_card_mastercard",
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
});
// Run the server
app.listen(PORT, (error) => {
  error
    ? console.log("Error", error)
    : console.log("Server is running at port", PORT);
});
