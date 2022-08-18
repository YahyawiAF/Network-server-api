import {
    Resolver,
    Mutation,
    Arg,
    Ctx,
    UseMiddleware,
    ObjectType,
    Field,
    InputType
} from "type-graphql";
import { validate } from "class-validator";

import { FileUpload, GraphQLUpload } from "graphql-upload";
const Vonage = require("@vonage/server-sdk");

const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;

import { User } from "../../../entity/User";
import { isAuth } from "../../../types/isAuth";
import { MyContext } from "../../../types/MyContext";
import { createSuggestions } from "../../utils/checkUsername";
import { responseType } from "./UserInfoTypes";
import { uploadFiles } from "../../../utils/uploadFiles";
import {
    getConnection, getRepository,
} from "typeorm";
import { Follower } from "../../../entity/followers";
import { Block } from "../../../entity/block";
import { Report } from "../../../entity/reportaccount";
import { Post } from "../../../entity/Post";
import { ProfileViews } from "../../../entity/profileView";
import { Experience } from "../../../entity/experience";
import { Community } from "../../../entity/community";
import { JoinedCommunties } from "../../../entity/joinedCommunities";


const vonage = new Vonage({
    apiKey: VONAGE_API_KEY,
    apiSecret: VONAGE_API_SECRET,
});

enum onboardingStatus {
    incomplete = "incomplete",
    completed = "completed",
}
@InputType()
@ObjectType()
class InterestResponse {
    @Field(() => [User], { nullable: true })
    following?: User[];

    @Field(() => [Community], { nullable: true })
    Community: Community[];
}

@Resolver()
export class UserInfoResolver {

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async UpdateFullName(
        @Arg("fullname") fullname: string,
        @Ctx() { payload }: MyContext,
    ): Promise<User> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) throw Error("User Not Found");

        await User.update(user.id, {
            fullName: fullname,
        }).catch((err) => { throw err });
        return user
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async verifyNumber(
        @Arg("phoneNnumber") phoneNnumber: string,
        @Ctx()
        { payload }: MyContext,
    ): Promise<any> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };

        await User.update(user.id, {
            phoneNumber: phoneNnumber,
        }).catch((err) => { throw err });

        await vonage.verify.request({
            number: phoneNnumber,
            brand: "EZD VERIFICATION",
            code_length: 6
        }, (err: Error, result: any) => {
            if (err) throw err;
            else {
                if (result["status"] == "0") {
                    return "Successfully Send Otp";
                } else {
                    throw result["error_text"];
                }
            }
        })
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async verifyCode(
        @Arg("otpcode") otpcode: string,
        @Arg("requestId") requestId: string,

        @Ctx()
        { payload }: MyContext,
    ): Promise<any> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };
        vonage.verify.check(
            {
                request_id: requestId,
                code: otpcode,
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
    }

    @Mutation(() => responseType)
    @UseMiddleware(isAuth)
    async editProfile(
        @Ctx()
        { payload }: MyContext,
        @Arg("userName", { nullable: true }) userName: string,
        @Arg("city", { nullable: true }) city: string,
        @Arg("country", { nullable: true }) country: string,
        @Arg("website", { nullable: true }) website: string,
        @Arg("dateOfBirth", { nullable: true }) dateOfBirth: string,
        @Arg("file", () => GraphQLUpload, { nullable: true },)
        file: FileUpload,
    ): Promise<any> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };
        let taken = await User.findOne({ userName: userName })
        let suggestion: any = []
        if (taken) {
            for (var i = 0; i < 3; i++) {
                let suggestedname = await createSuggestions(user.firstName)
                suggestion.push(suggestedname)
            }
            let response = {
                suggestion: suggestion,
                message: "User Name Already taken",
                success: false
            };
            return response
        }
        else {
            let uploaddata: any = {
                userName,
                city,
                country,
                website,
                dateOfBirth,
                onBoarding: onboardingStatus.completed
            }
            let image = '';
            if (file) {
                image = await uploadFiles(file, user.id)
                uploaddata["profileImage"] = image
            }
            const update = await User.update(user.id, uploaddata)
            if (update) {
                return {
                    success: true,
                    message: "Updated Succesfully"
                }
            }
        }
    }

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async getUserProfile(
        @Ctx()
        { payload }: MyContext,
    ): Promise<User | undefined> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };
        return user
    }

    @Mutation(() => [Post])
    @UseMiddleware(isAuth)
    async getUserMediaPosts(
        @Arg("userId") userId: string,
        @Ctx()
        { payload }: MyContext,
    ): Promise<Post | undefined> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };

        const qb = await getConnection()
            .getRepository(Post)
            .createQueryBuilder('post')
            .leftJoinAndSelect('user.posts', 'post', "post.userId = user.id AND post.url != null OR post.url != 'undefined'")
            .where('user = :userId', { userId: userId })
            .getOne();
        return qb
    }

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async getOtherUserProfile(
        @Ctx()
        { payload }: MyContext,
        @Arg("userId") userId: string,
    ): Promise<User | undefined> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };

        const userdata = await User.findOne({ id: userId })
        if (!userdata) {
            throw Error("User Not Found")

        }
        const profileRepository = getRepository(ProfileViews);
        let profileView = await profileRepository.findOne({ viewed_by: user, viewed_profile: userdata });

        if (!profileView) {
            await profileRepository.create({ viewed_by: user, viewed_profile: userdata }).save();
        }
        const qb = await getConnection()
            .getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.posts', 'post', "post.userId = user.id")
            .where('user.id = :userId', { userId: userId })
            .getOne();
        return qb

    }

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async getOtherUserMediaPosts(
        @Ctx()
        { payload }: MyContext,
        @Arg("userId") userId: string,
    ): Promise<User | undefined> {
        const user = await User.findOne({ id: payload.userId });
        if (!user) {
            throw Error("User Not Found")
        };
        const qb = await getConnection()
            .getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.posts', 'post', "post.userId = user.id AND post.url != null OR post.url != 'undefined'")
            .where('user.id = :userId', { userId: userId })
            .getOne();

        return qb
    }

    @Mutation(() => Number)
    @UseMiddleware(isAuth)
    async getProfleViews(
        @Ctx()
        { payload }: MyContext,
        @Arg("userId", { nullable: true }) userId?: string,
    ): Promise<any> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        const viewsRepository = getRepository(ProfileViews);
        if (userId) {
            let userdata;
            try {
                userdata = await userRepository.findOneOrFail({ id: userId });
            } catch (error) {
                throw new Error("User not found.");
            }
            let viewsdata = await viewsRepository.find({ viewed_profile: userdata });
            if (viewsdata) {
                const qb = await getConnection()
                    .getRepository(ProfileViews)
                    .count({
                        where:
                        {
                            viewed_profile: userId
                        }
                    });
                return qb
            }
        }
        else {
            let viewsdata = await viewsRepository.find({ viewed_profile: user });
            if (viewsdata) {
                const qb = await getConnection()
                    .getRepository(ProfileViews)
                    .count({
                        where:
                        {
                            viewed_profile: payload.userId
                        }
                    })

                return qb
            }
        }
    }

    @Mutation(() => InterestResponse)
    @UseMiddleware(isAuth)
    async getUserInterests(
        @Ctx()
        { payload }: MyContext,
    ): Promise<any> {
        InterestResponse
        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }
        user
        const followingqb = await getConnection()
            .getRepository(User)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.follower", "following", "following.follower = user.id")
            .leftJoinAndSelect("following.following", "followers")
            .where("user.id= :id", { id: payload.userId });
        let followingusers: any = [];
        const followingdata = await followingqb.getOne();

        followingdata && followingdata.follower.forEach(item => {
            followingusers.push(item)
        })

        const communitiesqb = await getConnection()
            .getRepository(JoinedCommunties)
            .createQueryBuilder('joined')
            .leftJoinAndSelect('joined.community', 'community', "community.id = joined.community")
            .where('joined.user= :userId', { userId: payload.userId })
        const communities = await communitiesqb.getMany();

        let communitydata: any = [];
        communities && communities.forEach(item => {
            communitydata.push(item.community)
        })

        if (followingusers.length > 0 && communitydata.length > 0) {
            const data = {
                following: followingusers,
                Community: communitydata
            }
            return data
        }
        else {
            throw Error("Something Went Wrong")
        }
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async followUnfollow(
        @Ctx()
        { payload }: MyContext,
        @Arg("userId") userId: string,
    ): Promise<any> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        if (payload.userId === userId) {
            throw new Error("User cannot Follow themselves");
        }

        let followeduser = await User.findOne({ id: userId })
        if (!followeduser) {
            throw new Error("User You trying to Follo/Unfollow not found.");
        }

        const followerRepository = getRepository(Follower);

        const followers = await followerRepository.delete({ follower: user, following: followeduser })
        const following = await followerRepository.delete({ following: user, follower: followeduser })

        if (followers.affected !== 0 && following.affected !== 0) {
            return "User unfollowed Successfully";
        }

        const newfollower = await followerRepository.create({ follower: user, following: followeduser }).save()
        const newfollowing = await followerRepository.create({ follower: followeduser, following: user }).save()

        if (newfollower && newfollowing) {
            return "Followed Successfully"
        }
        else {
            throw Error("something Went Wrong")
        }
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async blockUnblock(
        @Ctx()
        { payload }: MyContext,
        @Arg("userId") userId: string,
    ): Promise<any> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        if (payload.userId === userId) {
            throw new Error("User cannot Block/Unblock themselves");
        }

        let blockedUser = await User.findOne({ id: userId })
        if (!blockedUser) {
            throw new Error("User You trying to Block was not found.");
        }

        const blockedRepository = getRepository(Block);

        const blocked_user = await blockedRepository.delete({ blocked_user: user, blockedby: blockedUser })
        const blockedby = await blockedRepository.delete({ blockedby: user, blocked_user: blockedUser })

        if (blocked_user.affected !== 0 && blockedby.affected !== 0) {
            return "User Unblocked Successfully";
        }

        const newblockedUser = await blockedRepository.create({ blocked_user: user, blockedby: blockedUser }).save()
        const newblockedby = await blockedRepository.create({ blockedby: user, blocked_user: blockedUser }).save()

        if (newblockedUser && newblockedby) {
            return "Blocked Successfully"
        }
        else {
            throw Error("something Went Wrong")
        }
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async reportUSer(
        @Ctx()
        { payload }: MyContext,
        @Arg("userId") userId: string,
    ): Promise<any> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        if (payload.userId === userId) {
            throw new Error("User cannot Report themselves");
        }

        let reported = await User.findOne({ id: userId })
        if (!reported) {
            throw new Error("User You trying to Report  not found.");
        }

        const reportRepository = getRepository(Report);
        const reportedUser = await reportRepository.findOneOrFail({ reporteduser: user, reportedby: reported });

        if (reportedUser) {
            return "Already Reported"
        }

        await reportRepository.create({ reportedby: user, reporteduser: reported }).save()
        return "successfully reported"
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async addExperience(
        @Ctx()
        { payload }: MyContext,
        @Arg("title") title: string,
        @Arg("company") company: string,
        @Arg("location") location: string,
        @Arg("currentyly_working", { defaultValue: false }) currently_working: boolean,
        @Arg("headline") headline: string,
        @Arg("description", { nullable: true }) description: string,
        @Arg("employment_type", { nullable: true }) employment_type: string,
    ): Promise<string> {
        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }
        const experience = new Experience();
        experience.title = title;
        experience.user = user;
        experience.company = company;
        experience.location = location;
        if (currently_working) {
            experience.currently_working = currently_working;
        }
        experience.headline = headline;
        if (description) {
            experience.description = description;
        }
        if (employment_type) {
            experience.employment_type = employment_type;
        }

        const errors = await validate(experience);
        if (errors.length > 0) {
            console.log("Error Experience", errors);
            throw new Error("Sorry, something went wrong!");
        }
        const experienceRepository = getRepository(Experience);

        try {
            await experienceRepository.save(experience);
        } catch (e) {
            console.log(e);
            throw new Error("Sorry, something went wrong!");
        }
        return "Experience Saved"
    }
}
