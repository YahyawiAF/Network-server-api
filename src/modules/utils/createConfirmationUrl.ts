import { User } from "../../entity/User";
import { createAccessToken } from "../../types/auth";
export const createConfirmationUrl = async (user: User) => {
  const token = createAccessToken(user);

  return `http://localhost:3000/user/confirm/${token}`;
};

export const createForgotPasswordUrl = async (email: String, token: String) => {
  return `http://localhost:3000/forgotPassword/${email}/${token}`;
};
