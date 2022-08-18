import * as bcrypt from "bcryptjs";
const { v4: uuidv4 } = require("uuid");
import { Resolver, Mutation, Arg } from "type-graphql";

import { User } from "../../../entity/User";
import { sendEmail1 } from "../../utils/sendEmail";

@Resolver()
export class PasswordRecoveryResolver {
  @Mutation(() => String)
  async forgotPasswordMail(
    @Arg("email") email: string
  ): Promise<boolean | String> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User Not Found");
    }
    const resetToken = uuidv4();
    await User.update(user.id, {
      forgotPasswordToken: resetToken,
    });
    let content = "We have Recieved Change Password Request";
    let title = "Change Account Password";
    let url = `please visit :== http:localhost:3000/${email}/${resetToken}`;
    await sendEmail1(
      email,
      "FORGOTPASSWORD",
      { email, title, url, content, resetToken },
      "New Password"
    );
    return "Password Reset Token Send Successfully! Check Email Address";
  }

  @Mutation(() => String)
  async confirmmailPassword(
    @Arg("email") email: string,
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ): Promise<boolean | String> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User Not Found");
    }
    if (
      !user.forgotPasswordToken ||
      token !== user.forgotPasswordToken.toString()
    ) {
      throw new Error("Not Authorized");
    }
    const password = await bcrypt.hash(newPassword, 10);
    await User.update(
      { email: email },
      {
        password: password,
        forgotPasswordToken: undefined,
      }
    );
    return "Password Changed SuccessFully";
  }
}
