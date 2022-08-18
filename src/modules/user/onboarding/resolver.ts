import { Resolver, Mutation, Arg, Ctx, UseMiddleware } from "type-graphql";
import { User } from "../../../entity/User";
import { isAuth } from "../../../types/isAuth";
import { MyContext } from "../../../types/MyContext";

const Vonage = require("@vonage/server-sdk");

const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const vonage = new Vonage({
    apiKey: VONAGE_API_KEY,
    apiSecret: VONAGE_API_SECRET,
});



@Resolver()
export class UserOnBoardingResolver {
    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async UserfullName(
        @Arg("fullname") fullname: string,
        @Ctx() { payload }: MyContext,
    ): Promise<String> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) throw Error("User Not Found");
        await User.update(user.id, {
            fullName: fullname,
        }).catch((err) => { throw err });
        return "Updated Successfully"
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async sendverificationCode(
        @Arg("phoneNnumber") phoneNumber: string,
        @Ctx()
        { payload }: MyContext,
    ): Promise<any> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };

        await vonage.verify.request({
            number: phoneNumber,
            brand: "EZD VERIFICATION",
            code_length: 6
        }, (err: Error, result: any) => {
            if (err) { throw err; } else {
                if (result["status"] == "0") {
                    const requestId = result.request_id;
                    console.log(requestId)
                    return `Otp id ${requestId}`;
                } else {
                    throw result["error_text"];
                }
            }
        })
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async verifiyNumber(
        @Arg("otpCode") otpCode: string,
        @Arg("requestId") requestId: string,

        @Ctx()
        { payload }: MyContext,
    ): Promise<String> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };

        await vonage.verify.check(
            {
                request_id: requestId,
                code: otpCode,
            },
            async (err: Error, result: any) => {
                if (err) {
                    console.error(err);
                } else {
                    if (result["status"] == "0") {

                    } else {
                    }
                }
            }
        );
        return "Success"
    }
}