import express from "express";
import { newUserValidation } from "../middleware/validationMiddleware/userValidation.js";
import { comparePassword, hashPassword } from "../utility/bcryptHelper.js";
import {
  createUser,
  findOtp,
  findUserByEmail,
  getUsers,
  updateUser,
} from "../Model/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { createSession, deleteSession } from "../Model/sessionModel.js";
import {
  sendAccountVerifiedEmail,
  sendOTP,
  sendVerificationLinkEmail,
} from "../utility/nodemailerHelper.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/responseHelper.js";
import { generateJWTs } from "../utility/jwtHelper.js";
import {
  adminAuth,
  refreshAuth,
} from "../middleware/authMiddleware/authMiddleware.js";
import generateOTP from "../utility/otpGenerateHelper.js";
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

    if (userEmail && token) {
      // Delete the session if it matches to avoid having too many in the database
      const result = await deleteSession({ token, userEmail });

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

    // Find user by email

    const user = await findUserByEmail(email);

    //return error if user is not found or not verified
    if (!user?._id) {
      buildErrorResponse(res, "User account does not exist!");
      return;
    }

    if (!user?.isVerified) {
      buildErrorResponse(res, "User is not verified");
      return;
    }

    if (user?.role !== "admin") {
      buildErrorResponse(res, "You are not authorized to access this app");
      return;
    }
    // Compare password
    const isPasswordMatched = comparePassword(password, user.password);
    // Generate and send back tokens

    if (isPasswordMatched) {
      const jwt = await generateJWTs(user.email);

      buildSuccessResponse(res, jwt, "Logged in Successfully");
      return;
    }

    return buildErrorResponse(res, "Invalid Credentials");
  } catch (error) {
    buildErrorResponse(res, "Invalid Credentials");
  }
});

// PRIVATE ROUTES

//Get user
userRouter.get("/", adminAuth, async (req, res) => {
  try {
    buildSuccessResponse(res, req.userInfo, "User Info");
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

// Get users
userRouter.get("/all", adminAuth, async (req, res) => {
  try {
    const users = await getUsers();

    if (users?.length > 0) {
      return buildSuccessResponse(res, users, "Got all users");
    }
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

// GET NEW ACCESS TOKEN
userRouter.get("/accessjwt", refreshAuth);

//LOGOUT USER
userRouter.post("/logout", adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const { authorization } = req.headers;

    //remove session for the user
    await deleteSession({ token: authorization, userEmail: email });

    buildSuccessResponse(res, {}, "Bye, See you again!!");
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

export default userRouter;

// Send OTP

userRouter.post("/verify-email", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    if (!user?._id) {
      return buildErrorResponse(res, "User account does not exist!");
    }
    {
      const otp = generateOTP(6);
      const session = await updateUser(
        { email: email },
        {
          Otp: otp,
        }
      );
      if (session?._id) {
        sendOTP(otp, email);
        return buildSuccessResponse(
          res,
          {},
          "OTP sent successfully, Please check your email!"
        );
      }
    }
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});
userRouter.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;

    const result = await findOtp({
      Otp: otp,
    });

    if (!result?._id) {
      return buildErrorResponse(res, "Invalid OTP!!");
    }

    return buildSuccessResponse(
      res,
      result,
      "OTP verified successfully, Please enter your new password"
    );
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

userRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user?._id) {
      return buildErrorResponse(res, " User doesnot exist!!");
    }

    const encryptedPassword = hashPassword(password);
    const updatedUser = await updateUser(
      { email },
      {
        password: encryptedPassword,
      }
    );

    if (!updatedUser?._id) {
      return buildErrorResponse(res, " Failed to update Password");
    }

    return buildSuccessResponse(
      res,
      updatedUser,
      "Password Changed Successfully! Please login"
    );
  } catch (error) {}
});
