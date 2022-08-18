import {
  Resolver,
  UseMiddleware,
  Ctx,
  Mutation,
  Arg,
  InputType,
  ObjectType,
  Field,
} from "type-graphql";
import { getConnection, In } from "typeorm";

import { MyContext } from "../../types/MyContext";
import { isAuth } from "../../types/isAuth";
import { User } from "../../entity/User";

enum accountStatus {
  Disabled = "disabled",
  Enable = "enable",
}

@InputType()
@ObjectType()
class StatusInput {
  @Field()
  status: String;

  @Field(() => [String])
  userId: String[];
}

@Resolver()
export class AdminResolver {
  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async updateUserStatus(
    @Arg("StatusInput") StatusInput: StatusInput,
    @Ctx()
    { payload }: MyContext
  ): Promise<String> {
    try {
      if (payload.userType !== "admin") return "Not Authorized";
      await getConnection()
        .getRepository(User)
        .createQueryBuilder()
        .update(User)
        .set({ account_status: accountStatus.Enable })
        .where({ id: In(StatusInput.userId) })
        .execute();
      return "Status Updated Successfully";
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
}
