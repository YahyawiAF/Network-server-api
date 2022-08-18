import { Resolver, Query, Mutation, Arg } from "type-graphql";

import { User } from "../../../entity/User";
import { RegisterInput } from "./RegisterInput";
import { createConfirmationUrl } from "../../utils/createConfirmationUrl";
import { sendEmail } from "../../utils/sendEmail";

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  async hello() {
    return "Hello World!";
  }

  @Mutation(() => User)
  async register(
    @Arg("data")
    { email, firstName, lastName, password }: RegisterInput
  ): Promise<User> {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    }).save();
    await sendEmail(email, await createConfirmationUrl(user));
    return user;
  }
}
