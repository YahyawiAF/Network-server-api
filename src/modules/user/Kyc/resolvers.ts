import { Resolver, Mutation, Arg, UseMiddleware, Ctx } from "type-graphql";
import {
  PersonalInfoInput,
  AccountInfoInput,
  AddressInfoInput,
  WalletInput,
} from "./RegisterInput";
import { createWriteStream } from "fs";

import { isAuth } from "../../../types/isAuth";
import { MyContext } from "../../../types/MyContext";
import { User } from "../../../entity/User";
import { Wallet } from "../../../entity/Wallet";
import { FileUpload, GraphQLUpload } from "graphql-upload";

@Resolver()
export class KYCResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async UpdateprofilePicture(
    @Arg("file", () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
    @Ctx() { payload }: MyContext
  ) {
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(__dirname + `/images/${filename}`))
        .on("finish", async () => {
          const user = await User.findOne({ id: payload.userId });
          if (!user) throw Error("User Not Found");
          await User.update(
            { id: payload.userId },
            { profileImage: `/images/${filename}` }
          ).catch((err: any) => {
            throw err;
          });
          resolve(true);
        })
        .on("error", (err: Error) => reject(err))
    );
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async UpdatePersonalInfo(
    @Arg("personalInfoInput")
    { firstName, middleName, lastName }: PersonalInfoInput,
    @Ctx() { payload }: MyContext
  ): Promise<any> {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    await User.update(
      { id: payload.userId },
      { firstName: firstName, lastName: lastName, middleName: middleName }
    ).catch((err: any) => {
      throw err;
    });
    return "updated Successfully";
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async UpdateAccountInfo(
    @Arg("accountInfoInput")
    { dateOfBirth, country, email, phoneNumber }: AccountInfoInput,
    @Ctx() { payload }: MyContext
  ): Promise<any> {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");

    await User.update(
      { id: payload.userId },
      { dateOfBirth, country: country, email, phoneNumber }
    ).catch((err: any) => {
      throw err;
    });
    return "updated Successfully";
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async UpdateAddressInfo(
    @Arg("addressInfoInput")
    { city, postalCode, address1, address2 }: AddressInfoInput,
    @Ctx() { payload }: MyContext
  ): Promise<any> {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    await User.update(
      { id: payload.userId },
      { city, postalCode, address1, address2 }
    ).catch((err: any) => {
      throw Error(err);
    });
    return "updated Successfully";
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async signContract(
    @Arg("contractInfoInput")
    { sign_message, wallet_address }: WalletInput,
    @Ctx() { payload }: MyContext
  ): Promise<any> {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    await Wallet.create({
      userId: payload.userId,
      sign_message,
      wallet_address,
    }).save();
    return "Wallet Connected Successfully";
  }
}
