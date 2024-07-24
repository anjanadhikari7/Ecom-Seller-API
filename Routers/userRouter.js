import express from "express";
import { newUserValidation } from "../middleware/validationMiddleware/userValidation.js";
import { comparePassword, hashPassword } from "../utility/bcryptHelper.js";
import { createUser, findUserByEmail, updateUser } from "../Model/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { createSession, deleteSession } from "../Model/sessionModel.js";
import {
  sendAccountVerifiedEmail,
  sendVerificationLinkEmail,
} from "../utility/nodemailerHelper.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/responseHelper.js";
import { generateJWTs } from "../utility/jwtHelper.js";
const userRouter = express.Router();

// Create USER | POST |Signup
userRouter.post("/", newUserValidation, async (req, res) => {
  try {
    // hash password

    const { password } = req.body;
    const encryptedPassword = hashPassword(password);

    // Create user in Database

    const user = await createUser({
      ...req.body,
      password: encryptedPassword,
    });
    // If user is created send a verification email

    if (user?.id) {
      const secureId = uuidv4();
      // storing this id against user email in session storage to verify whether the email is sent by us or not
      const session = await createSession({
        token: secureId,
        userEmail: user.email,
      });

      if (session?._id) {
        // create verification link and send email

        const verificationUrl = `${process.env.CLIENT_ROOT_URL}/verify-email?e=${user.email}&id=${secureId}`;
        // Now send an email
        sendVerificationLinkEmail(user, verificationUrl);
      }
    }
    user?._id
      ? buildSuccessResponse(
          res,
          {},
          "Check your inbox/spam to verify your email"
        )
      : buildErrorResponse(res, "Could not register the user");
  } catch (error) {
    if (error.code === 11000) {
      error.message = "User with this email already exists!!";
    }

    buildErrorResponse(res, error.message);
  }
});

// PUBLIC | Verify user email

userRouter.patch("/verify-email", async (req, res) => {
  try {
    const { userEmail, token } = req.body;
    console.log("userEmail:", userEmail);
    console.log("token:", token);

    if (userEmail && token) {
      // Delete the session if it matches to avoid having too many in the database
      const result = await deleteSession({ token, userEmail });
      console.log(result);
      // If token existed in the session against this user
      if (result?._id) {
        // Update the user to verified status
        const user = await updateUser(
          { email: userEmail },
          { isVerified: true }
        );

        if (user?._id) {
          // Send account verified email and welcome email
          sendAccountVerifiedEmail(user, process.env.CLIENT_ROOT_URL);
        }
      }
      return buildSuccessResponse(res, {}, "Your email is verified");
    }

    // If verification fails
    return buildErrorResponse(res, "Account cannot be verified");
  } catch (error) {
    // Handle any unexpected errors
    return buildErrorResponse(res, "Account cannot be verified");
  }
});

// Public

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    // Find user by email

    const user = await findUserByEmail(email);
    console.log(user);

    //return error if user is not found or not verified
    if (!user?._id) {
      return buildErrorResponse(res, "User account does not exist!");
    }

    if (!user?.isVerified) {
      return buildErrorResponse(res, "User is not verified");
    }

    if (user?.role !== "admin") {
      return buildErrorResponse(
        res,
        "You are not authorized to access this app"
      );
    }
    // Compare password
    const isPasswordMatched = comparePassword(password, user.password);
    // Generate and send back tokens

    if (isPasswordMatched) {
      const jwt = await generateJWTs(user.email);

      return buildSuccessResponse(res, jwt, "Logged in Successfully");
    }

    return buildErrorResponse(res, "Invalid Credentials");
  } catch (error) {
    buildErrorResponse(res, "Invalid Credentials");
  }
});

export default userRouter;
