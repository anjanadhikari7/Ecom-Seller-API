import userSchema from "../Schema/userSchema.js";

// create a user
export const createUser = (userObj) => {
  return userSchema(userObj).save();
};

// Update User
export const updateUser = (filter, updatedUser) => {
  return userSchema.findOneAndUpdate(filter, updatedUser, { new: true });
};

// Find user by email

export const findUserByEmail = (email) => {
  return userSchema.findOne({ email });
};
