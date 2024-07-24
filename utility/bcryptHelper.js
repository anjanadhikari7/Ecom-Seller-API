import bcrypt from "bcryptjs";

const salt = 20;

export const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, salt);
};

export const comparePassword = (plainPassword, hashPassword) => {
  return bcrypt.compareSync(plainPassword, hashPassword);
};
