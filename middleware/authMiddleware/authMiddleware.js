import { getSession } from "../../Model/sessionModel.js";
import { findUserByEmail } from "../../Model/userModel.js";
import {
  generateAccessJWT,
  verifyAccessJWT,
  verifyRefreshJWT,
} from "../../utility/jwtHelper.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/responseHelper.js";

// Admin Auth
export const adminAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    // Validate if accessJet is valid

    const decoded = verifyAccessJWT(authorization);

    if (decoded?.email) {
      const session = await getSession({
        token: authorization,
        userEmail: decoded.email,
      });

      if (session?._id) {
        const user = await findUserByEmail(decoded.email);
        if (user?._id && user?.isVerified && user?.role === "admin") {
          user.password = undefined;
          req.userInfo = user;

          return next();
        }
      }
    }

    throw new error("Invalid token, unauthorized");
  } catch (error) {
    return buildErrorResponse(res, error.message || "Invalid token!!");
  }
};

// RefreshAuth

export const refreshAuth = async (req, res) => {
  try {
    const { authorization } = req.headers;
    // Validate and decode refresh token
    const decoded = verifyRefreshJWT(authorization);

    // get the user based on email and generate new access token for the user
    if (decoded?.email) {
      const user = await findUserByEmail(decoded.email);

      if (user?._id) {
        // generate new access token and return back that token to client
        const accessJWT = await generateAccessJWT(user.email);

        return buildSuccessResponse(res, accessJWT, "New Access Token");
      }
    }

    throw new Error("Invalid token!!");
  } catch (error) {
    return buildErrorResponse(res, error.message);
  }
};
