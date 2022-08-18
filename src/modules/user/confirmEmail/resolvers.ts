import { Resolver, Mutation, Arg } from "type-graphql";

import { User } from "../../../entity/User";
import { verify } from "jsonwebtoken";

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => Boolean)
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    const payload: any = await verify(token, process.env.ACCESS_TOKEN_SECRET!);
    let userId: string = payload.userId;
    if (!payload.userId) {
      return false;
    }
    await User.update(userId, { confirmed: true });
    return true;
  }
}
