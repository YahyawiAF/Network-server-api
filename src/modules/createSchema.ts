import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";

import { RegisterResolver } from "./user/register/resolvers";
import { LoginResolver } from "./user/login/resolvers";
import { ConfirmUserResolver } from "./user/confirmEmail/resolvers";
import { KYCResolver } from "./user/Kyc/resolvers";
import { createkyc } from "./user/Kyc/step-three";
import { TicketResolver } from "./tickets/resolver";
import { PasswordRecoveryResolver } from "./user/passwordRecovery/resolvers";
import { AdminResolver } from "./admin/resolver";
import { UserOnBoardingResolver } from "./user/onboarding/resolver";
import { UserInfoResolver } from "./user/userDetails/UserInfo";
import { PostResolver } from "./post/resolvers";
import { CommentResolver } from "./comment/resolvers";
import { CommunityResolver } from "./community/resolver";
import { EventResolver } from "./event/resolvers";

export async function generateSchema(): Promise<GraphQLSchema> {
  try {
    const schema = await buildSchema({
      resolvers: [
        RegisterResolver,
        LoginResolver,
        ConfirmUserResolver,
        KYCResolver,
        createkyc,
        TicketResolver,
        PasswordRecoveryResolver,
        AdminResolver,
        UserOnBoardingResolver,
        UserInfoResolver,
        PostResolver,
        CommentResolver,
        CommunityResolver,
        EventResolver
      ],
    });
    return schema;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
