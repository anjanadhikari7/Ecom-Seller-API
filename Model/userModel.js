import userSchema from "../Schema/userSchema.js";

// create a user
export const createUser = (userObj) => {
  return userSchema(userObj).save();
};

// Get users

export const getUsers = () => {
  return userSchema.find();
};
// Update User
export const updateUser = (filter, updatedUser) => {
  return userSchema.findOneAndUpdate(filter, updatedUser, {
    new: true,
  });
};

// Find user by email

export const findUserByEmail = (email) => {
  return userSchema.findOne({ email });
};

export const findOtp = (otp) => {
  return userSchema.findOne(otp);
};

//Delete User

export const deleteUser = (_id) => {
  return userSchema.findByIdAndDelete(_id);
};
