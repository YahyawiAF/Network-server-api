import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import { compare } from "bcryptjs";

import { User } from "../../../entity/User";
import { MyContext } from "../../../types/MyContext";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../../../types/auth";
import { LoginResponse } from "./LoginTypes";

@Resolver()
export class LoginResolver {
  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse | null> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("could not find user");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error("bad password");
    }
    if (!user.confirmed) {
      throw new Error("User not confirmed");
    }
    sendRefreshToken(res, createRefreshToken(user));
    return {
      accessToken: createAccessToken(user),
      user,
    };
  }
}
