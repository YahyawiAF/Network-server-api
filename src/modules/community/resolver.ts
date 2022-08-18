import {
    Resolver,
    UseMiddleware,
    Ctx,
    Arg,
    Mutation,
    InputType,
    ObjectType,
    Field,
    registerEnumType,
} from "type-graphql";
import { validate } from "class-validator";


import { MyContext } from "../../types/MyContext";
import { isAuth } from "../../types/isAuth";
import { User } from "../../entity/User";
import { Community } from "../../entity/community";
import { getConnection, getRepository } from "typeorm";
import { JoinedCommunties } from "../../entity/joinedCommunities";
import { JoinCommunityRequest } from "../../entity/joinCommunityRequests";
import { RestrictedCommunitiesRequest } from "../../entity/restrictedCommunityRequest";

enum COMMUNITYTYPE {
    public = "public",
    private = "private",
    restricted = "restricted",
}

enum REQUESTSTATUS {
    approved = "approved",
    pending = "pending",
    rejected = "rejected",
}

registerEnumType(COMMUNITYTYPE, {
    name: "CommunityType", // this one is mandatory
    description: "Type of Community", // this one is optional
});

@InputType()
@ObjectType()
class CommunityInput {
    @Field()
    communityName: string;

    @Field({ defaultValue: false })
    adult_community: boolean;
}

@Resolver()
export class CommunityResolver {
    @Mutation(() => Community)
    @UseMiddleware(isAuth)
    async CreateCommunity(
        @Arg("CommunityInput") { communityName, adult_community }: CommunityInput,
        @Arg("communityType") communityType: COMMUNITYTYPE,
        @Ctx() { payload }: MyContext): Promise<any> {
        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }
        const community = new Community();
        community.communityName = communityName;
        community.adult_community = adult_community;
        community.communityType = communityType;
        community.communityAdmin = user;
        community.communityHolder = `@${communityName.replace(/[^A-Z0-9]/ig, "")}`;

        const errors = await validate(community);
        if (errors.length > 0) {
            throw new Error("Event not valid");
        }
        await community.save().catch(err => {
            if (err.code = '23505') { throw Error("Community Already Exist") };
            console.log("error", err)
            throw Error("Cannot Add Community")
        });
        return community
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async joinCommunity(
        @Arg("communityId") communityId: string,
        @Ctx() { payload }: MyContext
    ): Promise<string> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        const communityRepository = getRepository(Community);
        let community;
        try {

            community = await communityRepository.findOneOrFail({ id: communityId });
        } catch (error) {
            throw new Error("Community not found.");
        }
        if (community.communityType === "private") {
            throw Error("Please Request to Join Private Community")
        }
        const alreadyjoined = await JoinedCommunties.findOne({ community: community, user: user })
        if (alreadyjoined) {
            throw Error("Community Already Joined")
        }

        const joinCommunity = new JoinedCommunties()
        joinCommunity.community = community
        joinCommunity.user = user
        joinCommunity.communityType = community.communityType
        const joinCommunityRepository = getRepository(JoinedCommunties);
        try {
            await joinCommunityRepository.save(joinCommunity);
        } catch (e) {
            console.log(e);
            throw new Error("Sorry, something went wrong!");
        }

        return "Community Joined Successfully"
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async requestpostRestrictedCommunity(
        @Arg("communityId") communityId: string,
        @Ctx() { payload }: MyContext): Promise<string> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        const communityRepository = getRepository(Community);
        let community;
        try {
            community = await communityRepository.findOneOrFail({ id: communityId });
        } catch (error) {
            throw new Error("Community not found.");
        }

        const joined = await JoinedCommunties.findOne({ community: community, user: user })
        if (!joined) {
            throw Error("Please Join Community First")
        }

        let alreadyrequested = await RestrictedCommunitiesRequest.findOne({ community: community, user: user })
        if (alreadyrequested) {
            throw Error("Already Requested")
        }

        const restrictedCommunity = RestrictedCommunitiesRequest.create({
            community: community,
            user: user,
        })

        const restrictedCommunityRepository = getRepository(RestrictedCommunitiesRequest);
        try {
            await restrictedCommunityRepository.save(restrictedCommunity);
        } catch (e) {
            console.log(e);
            throw new Error("Sorry, something went wrong!");
        }
        return "Request Successful"
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async approveCommunityRequest(
        @Arg("requestId") requestId: string,
        @Ctx() { payload }: MyContext): Promise<string> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }
        user

        const requestqb = await getConnection()
            .getRepository(RestrictedCommunitiesRequest)
            .createQueryBuilder("res")
            .leftJoinAndSelect("res.community", "com", "com.id = res.community")
            .leftJoinAndSelect("res.user", "user", "user.id = res.user")
            .where("res.id= :id", { id: requestId });

        let requestdata = await requestqb.getOne();
        if (!requestdata) {
            throw Error("Request Not Found")
        }

        let communityId = requestdata.community.id;
        let userId = requestdata.user.id;
        const communityqb = getConnection()
            .getRepository(Community)
            .createQueryBuilder("community")
            .leftJoinAndSelect("community.communityAdmin", "user", "user.id = community.communityAdmin")
            .where("community.id= :id", { id: communityId })

        const communitydata = await communityqb.getOne();
        if (!communitydata) {
            throw Error("Request Not Found")
        }

        if (communitydata.communityAdmin.id !== payload.userId) {
            throw Error("Not Authorized")
        }
        if (communitydata.communityAdmin.id === userId) {
            throw Error("Admin Cannot self join")
        }
        await RestrictedCommunitiesRequest.update({ id: requestId }, { approved: true });
        await getConnection()
            .createQueryBuilder()
            .update(JoinedCommunties)
            .set({ requestStatus: REQUESTSTATUS.approved })
            .where("community = :community AND user = :user", { community: communitydata.id, user: userId })
            .execute();
        return "Request Successfully Approved"
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async requestjoinPrivateCommunity(
        @Arg("communityId") communityId: string,
        @Arg("message", { defaultValue: "I would like to join this community" }) message: string,
        @Ctx() { payload }: MyContext): Promise<string> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }

        const communityRepository = getRepository(Community);
        let community;
        try {
            community = await communityRepository.findOneOrFail({ id: communityId });
        } catch (error) {
            throw new Error("Community not found.");
        }

        let alreadyrequested = await JoinCommunityRequest.findOne({ community: community, user: user })
        if (alreadyrequested) {
            throw Error("Join Request Already exists")
        }

        const joinCommunity = JoinCommunityRequest.create({
            community: community,
            user: user,
            message: message
        })

        const joinCommunityRepository = getRepository(JoinCommunityRequest);
        try {
            await joinCommunityRepository.save(joinCommunity);
        } catch (e) {
            console.log(e);
            throw new Error("Sorry, something went wrong!");
        }
        return "Request Successful"
    }

    @Mutation(() => String)
    @UseMiddleware(isAuth)
    async approvePrivateCommunityRequest(
        @Arg("requestId") requestId: string,
        @Ctx() { payload }: MyContext): Promise<string> {

        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }
        user

        const requestqb = await getConnection()
            .getRepository(JoinCommunityRequest)
            .createQueryBuilder("res")
            .leftJoinAndSelect("res.community", "com", "com.id = res.community")
            .leftJoinAndSelect("res.user", "user", "user.id = res.user")
            .where("res.id= :id", { id: requestId });

        let requestdata = await requestqb.getOne();
        if (!requestdata) {
            throw Error("Request Not Found")
        }

        let communityId = requestdata.community.id;
        let userId = requestdata.user.id;
        const communityqb = getConnection()
            .getRepository(Community)
            .createQueryBuilder("community")
            .leftJoinAndSelect("community.communityAdmin", "user", "user.id = community.communityAdmin")
            .where("community.id= :id", { id: communityId })

        const alreadyJoined = await JoinedCommunties.findOne({ user: requestdata.user, community: requestdata.community })
        if (alreadyJoined) {
            throw Error("Community Already Joined")
        }

        const communitydata = await communityqb.getOne();
        if (!communitydata) {
            throw Error("Request Not Found")
        }

        if (communitydata.communityAdmin.id !== payload.userId) {
            throw Error("Not Authorized")
        }
        if (communitydata.communityAdmin.id === userId) {
            throw Error("Admin Cannot self join")
        }
        await JoinCommunityRequest.update({ id: requestId }, { approved: true })

        await JoinedCommunties.create({
            community: communitydata,
            user: requestdata.user,
            requestStatus: REQUESTSTATUS.approved,
            communityType: communitydata.communityType
        }).save()
        return "Request Successfully Approved"
    }

    @Mutation(() => Community)
    @UseMiddleware(isAuth)
    async getCommunity(
        @Arg("communityId") communityId: string,
        @Ctx() { payload }: MyContext): Promise<Community | null> {

        const userRepository = getRepository(User);
        communityId
        let user;
        try {
            user = await userRepository.findOneOrFail({ id: payload.userId });
        } catch (error) {
            throw new Error("User not found.");
        }
        user

        const requestqb = await getConnection()
            .getRepository(Community)
            .createQueryBuilder("community")
            .leftJoinAndSelect("community.joinedUsers", "joined", "joined.community = community.id")
            .leftJoinAndSelect("joined.user", "user")
            .where("community.id= :id", { id: communityId });

        let communitydata = await requestqb.getOne();

        if (communitydata) return communitydata
        else {
            throw Error("Something went wrong")
        }
    }

}
