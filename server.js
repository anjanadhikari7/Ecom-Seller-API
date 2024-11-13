import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import userRouter from "./Routers/userRouter.js";
import categoryRouter from "./Routers/categoryRouter.js";
import productRouter from "./Routers/productRouter.js";
import orderRouter from "./Routers/orderRouter.js";
import { connectToMongoDb } from "./config/dbConfig.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// Get the client URL from the environment variable
const clientUrl = process.env.CLIENT_ROOT_URL;

// Middlewares
app.use(
  cors({
    origin: clientUrl.endsWith("/") ? clientUrl : `${clientUrl}/`, // Ensure trailing slash consistency
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // Explicitly handle preflight requests
app.use(express.json());

// Connect to Database
connectToMongoDb();

// Serve Images to Client
app.use(express.static(path.join(__dirname, "/public")));

// Routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);

// Stripe Integration
const stripe = new Stripe(process.env.STRIPE_API_KEY);

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "aud",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run the server
app.listen(PORT, (error) => {
  error
    ? console.log("Error", error)
    : console.log("Server is running at port", PORT);
});
