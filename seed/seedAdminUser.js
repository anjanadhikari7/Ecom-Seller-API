import "dotenv/config";
import mongoose from "mongoose";
import { connectToMongoDb } from "../config/dbConfig.js";
import { createUser, findUserByEmail } from "../Model/userModel.js";
import { hashPassword } from "../utility/bcryptHelper.js";

const seedAdminUser = async () => {
  // connect to DB
  connectToMongoDb();

  // Define | Prepare the data - admin user

  const adminUserObject = {
    isVerified: true,
    role: "admin",
    firstName: "EcomDen",
    lastName: "Admin",
    email: "admin@test.com",
    phone: "00000000000",
    address: "123 STreet, Sydney",
  };

  // Check if email already exists

  const existingUser = await findUserByEmail(adminUserObject.email);

  if (existingUser) {
    console.log("User already exists!!");
    process.exit(0);
  }

  // Hash the password

  const hashedPassword = hashPassword("strongPassword");

  // Create a user in DB

  const user = await createUser({
    ...adminUserObject,
    password: hashedPassword,
  });

  // Disconnect our db

  mongoose.disconnect();
};

// Execute this seeder

seedAdminUser()
  .then(() => {
    console.log("Admin user is seeded in db");
    process.exit(0);
  })
  .catch((error) => {
    console.log("Error", error.message);
    process.exit(1);
  });
