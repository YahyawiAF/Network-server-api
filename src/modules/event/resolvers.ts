import {
  Resolver,
  UseMiddleware,
  Ctx,
  Mutation,
  Arg,
  InputType,
  ObjectType,
  Field,
  Query,
} from "type-graphql";

import { MyContext } from "../../types/MyContext";
import { isAuth } from "../../types/isAuth";
import { User } from "../../entity/User";
import { Event } from "../../entity/Event";
import { Photo } from "../../entity/Photo";
import { Localization } from "../../entity/Localization";
import { getConnection, getRepository } from "typeorm";
import { validate } from "class-validator";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { createWriteStream } from "fs";

@InputType()
@ObjectType()
class EventInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  text: string;

  @Field({ nullable: true })
  experience: string;

  @Field({ nullable: true })
  peopleInvolvingNumber: number;

  @Field(() => [String], { nullable: true })
  speakerIds: [String];

  @Field({ nullable: true })
  eventPlan: string;

  @Field({ nullable: true })
  eventType: string;

  @Field({ nullable: true })
  eventCategory: string;

  @Field({ nullable: true })
  adress: string;

  @Field({ nullable: true })
  venue: string;

  @Field({ nullable: true })
  registration: string;
}

@Resolver()
export class EventResolver {
  @Query(() => Event)
  @UseMiddleware(isAuth)
  async getEventById(@Arg("id") id: string): Promise<Event> {
    const eventRepository = getRepository(Event);
    try {
      const event = await eventRepository.findOneOrFail(id);
      return event;
    } catch (error) {
      throw new Error("Event not found");
    }
  }

  @Query(() => [Event])
  @UseMiddleware(isAuth)
  async getUserEvent(@Ctx() { payload }: MyContext) {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    const qb = getConnection()
      .getRepository(Event)
      .createQueryBuilder("event")
      .innerJoinAndSelect("event.user", "u", "u.id = event.user")
      .where("event.user = :id", { id: payload.userId });
    const event = await qb.getMany();
    return event;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async creatEventStepOne(
    @Arg("EventInput") { title, description }: EventInput,
    @Ctx() { payload }: MyContext
  ) {
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ id: payload.userId });
    } catch (error) {
      throw new Error("User not found.");
    }
    const event = new Event();
    event.title = title;
    event.description = description || "";
    event.orginazer = user;
    const errors = await validate(event);
    if (errors.length > 0) {
      throw new Error("Event not valid");
    }
    const eventRepository = getRepository(Event);
    try {
      await eventRepository.save(event);
    } catch (e) {
      console.log(e);
      throw new Error("Sorry, something went wrong!");
    }

    return "Event created";
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async creatEventSteptwo(
    @Arg("id") id: string,
    @Arg("EventInput")
    { peopleInvolvingNumber, experience, speakerIds }: EventInput
  ) {
    const eventtRepository = getRepository(Event);
    let event: Event;
    try {
      event = await eventtRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }
    event.experience_level = experience || "";
    event.people_invole_planning = peopleInvolvingNumber;
    try {
      let speaker = await getConnection()
        .createQueryBuilder(User, "user")
        .where("user.id IN (:...ids)", { ids: speakerIds })
        .getMany();

      if (speaker.length > 0) {
        event.speaker = speaker;
      }
    } catch (error) {
      throw new Error("User not found.");
    }
    const errors = await validate(event);
    if (errors.length > 0) {
      throw new Error("Event not valid");
    }
    const eventRepository = getRepository(Event);
    try {
      await eventRepository.save(event);
    } catch (e) {
      console.log(e);
      throw new Error("Sorry, something went wrong!");
    }

    return "Event created";
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async creatEventStepThree(
    @Arg("EventInput") { eventCategory, eventType, eventPlan }: EventInput,
    @Arg("id") id: string
  ) {
    const eventtRepository = getRepository(Event);
    let event: Event;
    try {
      event = await eventtRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }
    event.event_category = eventCategory;
    event.event_type = eventType || "";
    event.event_host_plan = eventPlan;
    const errors = await validate(event);
    if (errors.length > 0) {
      throw new Error("Event not valid");
    }
    const eventRepository = getRepository(Event);
    try {
      await eventRepository.save(event);
    } catch (e) {
      console.log(e);
      throw new Error("Sorry, something went wrong!");
    }

    return "Event created";
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async eventLocalization(
    @Arg("EventInput") { adress, venue, registration }: EventInput,
    @Arg("id") id: string
  ) {
    const eventtRepository = getRepository(Event);
    let event: Event;
    try {
      event = await eventtRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }

    let localization = new Localization();
    localization.venue = venue;
    localization.adress = adress;
    localization.registration = registration;
    const errorLocalization = await validate(localization);
    if (errorLocalization.length > 0) {
      throw new Error("Localization not valid");
    }
    try {
      let res = await localization.save();
      event.localization = res;
    } catch (e) {
      console.log(e);
      throw new Error("Sorry, something went wrong!");
    }

    const errors = await validate(event);
    if (errors.length > 0) {
      throw new Error("Event not valid");
    }
    const eventRepository = getRepository(Event);
    try {
      await eventRepository.save(event);
    } catch (e) {
      console.log(e);
      throw new Error("Sorry, something went wrong!");
    }

    return "Event created";
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addEventPhotos(
    @Arg("file", () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
    @Arg("id") id: string,
    @Ctx() { payload }: MyContext
  ) {
    const eventRepository = getRepository(Event);
    let event: Event;
    try {
      event = await eventRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Event not found");
    }
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(__dirname + `/images/${filename}`))
        .on("finish", async () => {
          const user = await User.findOne({ id: payload.userId });
          if (!user) throw Error("User Not Found");
          const photo = new Photo();
          photo.url = "me.jpg";
          await Event.update({ id: event.id }, { photos: photo }).catch(
            (err: any) => {
              throw err;
            }
          );
          resolve(true);
        })
        .on("error", (err: Error) => reject(err))
    );
  }
}
