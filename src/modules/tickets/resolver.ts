import {
  Resolver,
  Query,
  UseMiddleware,
  Ctx,
  Mutation,
  InputType,
  Field,
  // ArgsType,
  // Args,
  Arg,
  ObjectType,
} from "type-graphql";

import { MyContext } from "../../types/MyContext";
import { isAuth } from "../../types/isAuth";

import { Ticket } from "../../entity/Tickets";
import { Message } from "../../entity/Message";
import { TicketActivity } from "../../entity/TicketActivity";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { User } from "../../entity/User";
import { getConnection } from "typeorm";

@InputType()
@ObjectType()
class MessageInput {
  @Field()
  message: String;

  @Field(() => [GraphQLUpload], { nullable: true })
  files?: FileUpload[]

  @Field(() => String, { nullable: true })
  taggedusers?: String[]

  @Field(() => String, { nullable: true })
  quotted_message_id?: String[]
}

enum TICKETCATEGORY {
  KYC_AML = "kyc_aml",
  PROFILE = "profile",
  ACCOUNT = "account",
  EXCHANGE = "exchange",
  LAUNCHPAD = "launchpad",
  FARMING = "farming",
  SECURITY = "security",
  PROMOTION = "promotion",
}

enum ACTIVITYTYPE {
  OPENED = "open",
  JOINED = "joined",
  LEFT = "left",
  TRANSFERED = "transfered",
  INVITED = "invited",
  SOLVED = "sloved",
  CLOSED = "closed",
}

@InputType()
class TicketArgs {
  @Field()
  subject: String;

  @Field()
  category: TICKETCATEGORY;

  @Field()
  messageInput: MessageInput;
}

@Resolver()
export class TicketResolver {
  @Query(() => [Ticket])
  @UseMiddleware(isAuth)
  async getUserTickets(@Ctx() { payload }: MyContext) {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    const qb = getConnection()
      .getRepository(Ticket)
      .createQueryBuilder("ticket")
      .innerJoinAndSelect("ticket.user", "u", "u.id = ticket.user")
      .where("ticket.user = :id OR ticket.category = :category", { id: payload.userId, category: "N/A" });
    const ticket = await qb.getMany();
    return ticket;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(isAuth)
  async createTickets(
    @Arg("ticketInput") ticketInput: TicketArgs,
    @Ctx()
    { payload }: MyContext,
  ): Promise<Ticket> {
    try {
      console.log("Adsd", payload)
      const ticket = await Ticket.create({
        subject: ticketInput.subject,
        category: ticketInput.category,
        user_id: payload.userId
      }).save();
      // if (!files) {
      await Message.create({
        ticket: ticket,
        message_text: ticketInput.messageInput.message,
        user_id: payload.userId,
      }).save();
      // } else {
      // }

      await TicketActivity.create({
        ticket: ticket,
        user_id: payload.userId,
        activity_type: ACTIVITYTYPE.OPENED,
      }).save();
      return ticket;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async removeTicket(
    @Arg("ticketId") ticketId: string,
    @Ctx()
    { payload }: MyContext,
  ): Promise<string> {
    try {
      const ticket = await Ticket.findOne({ id: ticketId });
      if (!ticket) return "Ticket Not Found"
      if (ticket.ticket_status === "open" || ticket.ticket_status === "inprogress" || ticket.ticket_status === "N/A") {
        return "Cannot remove ticket"
      }
      if (ticket.user_id !== payload.userId) {
        return "Not Authorized to remove"
      }
      await Ticket.delete({ id: ticketId })

      return "Ticket Removed Sucessfully"
    } catch (err) {
      throw err
    }
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async createTicketMessage(
    @Arg("ticketId") ticketId: string,
    @Arg("messageinput") messageinput: MessageInput,
    @Ctx()
    { payload }: MyContext,
  ): Promise<string> {
    try {
      const ticket = await Ticket.findOne({ id: ticketId });
      if (!ticket) return "Ticket Not Found"
      const message = await Message.create({
        message_text: messageinput.message,
        user_id: payload.userId,
        ticket_id: ticket.id
      }).save()
      if (message) return "Message added to ticket"
      else return "Error"
    } catch (err) {
      throw err
    }
  }
}
