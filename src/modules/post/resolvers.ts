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
import { Post } from "../../entity/Post";
import { Comment } from "../../entity/Comment";
import { Photo } from "../../entity/Photo";
import { Share } from "../../entity/Share";
import { getConnection, getRepository } from "typeorm";
import { validate } from "class-validator";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { createWriteStream } from "fs";

@InputType()
@ObjectType()
class PostInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  text: string;
}

@InputType()
@ObjectType()
class CommentInput {
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  @UseMiddleware(isAuth)
  async getAll(@Ctx() { payload }: MyContext) {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    const posts = await Post.find();
    return posts;
  }

  @Query(() => Post)
  @UseMiddleware(isAuth)
  async getOneById(@Arg("id") id: string): Promise<Post> {
    const postRepository = getRepository(Post);
    try {
      const post = await postRepository.findOneOrFail(id);
      return post;
    } catch (error) {
      throw new Error("Post not found");
    }
  }

  @Query(() => [Post])
  @UseMiddleware(isAuth)
  async getUserPost(@Ctx() { payload }: MyContext) {
    const user = await User.findOne({ id: payload.userId });
    if (!user) throw Error("User Not Found");
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")
      .innerJoinAndSelect("post.user", "u", "u.id = post.user")
      .where("post.user = :id", { id: payload.userId });
    const post = await qb.getMany();
    console.log("poasdsdf", post)
    return post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addPostPhotos(
    @Arg("file", () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
    @Arg("id") id: string,
    @Ctx() { payload }: MyContext
  ) {
    const postRepository = getRepository(Post);
    let post: Post;
    try {
      post = await postRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(__dirname + `/images/${filename}`))
        .on("finish", async () => {
          const user = await User.findOne({ id: payload.userId });
          if (!user) throw Error("User Not Found");
          const photo = new Photo();
          photo.url = "me.jpg";
          photo.post = post;
          await Post.update({ id: payload.userId }, { photos: [photo] }).catch(
            (err: any) => {
              throw err;
            }
          );
          resolve(true);
        })
        .on("error", (err: Error) => reject(err))
    );
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("PostInput") { title, url, text }: PostInput,
    @Ctx()
    { payload }: MyContext
  ): Promise<String> {
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ id: payload.userId });
    } catch (error) {
      throw new Error("User not found.");
    }
    if (url && text) {
      throw new Error("Sorry, you can either post a url or text, not both! 😾");
    }
    const post = new Post();
    post.title = title;
    post.url = url || "";
    post.text = text || "";
    post.user = user;
    const errors = await validate(post);
    if (errors.length > 0) {
      throw new Error("Post not valid");
    }
    const postRepository = getRepository(Post);
    try {
      await postRepository.save(post);
    } catch (e) {
      console.log(e);
      throw new Error("Sorry, something went wrong!");
    }

    return "Post created";
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async editPost(
    @Arg("id") id: string,
    @Arg("PostInput") { title, url, text }: PostInput,
    @Ctx()
    { payload }: MyContext
  ): Promise<String> {
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ id: payload.userId });
    } catch (error) {
      throw new Error("User not found.");
    }
    const postRepository = getRepository(Post);
    let post;
    try {
      post = await postRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }
    post.title = title;
    post.url = url;
    post.text = text;
    post.user = user;
    const errors = await validate(post);
    if (errors.length > 0) {
      console.log("error post", errors);
      throw new Error("Sorry, something went wrong!");
    }
    try {
      await postRepository.save(post);
    } catch (e) {
      throw new Error("Sorry, something went wrong!");
    }
    return "Post edited";
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async deletePost(@Arg("id") id: string): Promise<String> {
    const postRepository = getRepository(Post);
    try {
      await postRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Sorry, post does not exist in the first place !");
    }
    postRepository.delete(id);
    return "Post deleted";
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async listAllComments(@Arg("id") id: string): Promise<Comment[]> {
    const commentRepository = getRepository(Comment);
    try {
      const comments = await commentRepository
        .createQueryBuilder("comment")
        .leftJoinAndSelect("comment.user", "user")
        .where("comment.post.id = :id", { id })
        .getMany();
      return comments;
    } catch (error) {
      throw new Error("Comments not found for this post");
    }
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async newComment(
    @Arg("id") id: string,
    @Arg("CommentInput") { text }: CommentInput,
    @Ctx()
    { payload }: MyContext
  ): Promise<String> {
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ id: payload.userId });
    } catch (error) {
      throw new Error("User not found.");
    }
    const postRepository = getRepository(Post);
    let post;
    try {
      post = await postRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }
    const comment = new Comment();
    comment.text = text;
    comment.user = user;
    comment.post = post;
    const errors = await validate(comment);
    if (errors.length > 0) {
      console.log("errors", errors);
      throw new Error("Sorry, something went wrong!");
    }
    return "Comment created";
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async sharePost(
    @Arg("id") id: string,
    @Ctx()
    { payload }: MyContext
  ): Promise<String> {
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ id: payload.userId });
    } catch (error) {
      throw new Error("User not found.");
    }
    const postRepository = getRepository(Post);
    let post;
    try {
      post = await postRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Post not found");
    }
    const share = new Share();
    share.post = post;
    share.save();
    const errors = await validate(post);
    if (errors.length > 0) {
      throw new Error("Sorry, something went wrong!");
    }
    user.shares = [share];
    try {
      user = await userRepository.save(user);
      console.log(user)
    } catch (e) {
      throw new Error("Sorry, something went wrong!");
    }
    return "shared secussfully";
  }
}
