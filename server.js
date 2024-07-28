import "dotenv/config";
import express from "express";
import cors from "cors";
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

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/public")));

// Routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);

// Run the server
app.listen(PORT, (error) => {
  error
    ? console.log("Error", error)
    : console.log("Server is running at port", PORT);
});
