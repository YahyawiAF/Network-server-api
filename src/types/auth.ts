
import { sign } from "jsonwebtoken";
import { User } from "../entity/User";
import { Response } from "express";

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id, userType: user.userType }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export const createRefreshToken = (user: User) => {
  return sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};


export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: "/refresh_token",
  });
};