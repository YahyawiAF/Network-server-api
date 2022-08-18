import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";

import { createWriteStream } from "fs";
import { KYC } from "../../../../entity/Kyc";
import { isAuth } from "../../../../types/isAuth";
import { User } from "../../../../entity/User";
import { MyContext } from "../../../../types/MyContext";

enum IDTYPE {
  IDCard = "ID_CARD",
  PASSPORT = "PASSPORT",
  DRIVING = "DRIVING_LICENCE",
  SELFIE = "SELFIE",
  PROOFADDRESS = "PROOF_ADRESSE",
}

@InputType()
class Inputkyc {
  @Field()
  ID_type: IDTYPE;

  @Field()
  ID_number: Number;

  @Field()
  expiration_date: Date;
}

@Resolver()
export class createkyc {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async KycUserIdDocumentation(
    @Arg("file", () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
    @Arg("input") input: Inputkyc,
    @Ctx() { payload }: MyContext
  ) {
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(__dirname + `/images/${filename}`))
        .on("finish", async () => {
          let kyc = KYC.create({
            ...input,
            img: `/images/${filename}`,
          });
          let user = await User.findOne({ id: payload.userId });
          if (user) kyc.user = user;
          kyc.save();
          resolve(true);
        })
        .on("error", (err: Error) => reject(err))
    );

    // Storage google cloud
    //   new Promise((resolve, reject) =>
    //   createReadStream()
    //     .pipe(
    //       storage.bucket(bucketName).file(filename).createWriteStream({
    //         resumable: false,
    //         gzip: true,
    //       })
    //     )
    //     .on("error", (err) => reject(err))
    //     .on("finish", () =>
    //       storage
    //         .bucket(bucketName)
    //         .file(filename)
    //         .makePublic()
    //         .then((e) => {
    //           imgURL = `https://storage.googleapis.com/kyc-sign-three/${e[0].object}`;
    //           console.log("xxxxxxxxxxxxxxxxxxxxxxxxx", e, imgURL);
    //           // Post.create({
    //           //   ...input,
    //           //   creatorId: req.session.userId,
    //           //   img: imgURL,
    //           // }).save();
    //           resolve(true);
    //         })
    //     )
    // );
  }
}
