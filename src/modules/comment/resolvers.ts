import {
  Resolver,
  UseMiddleware,
  Mutation,
  Arg,
  Query,
} from "type-graphql";

import { isAuth } from "../../types/isAuth";
import { Comment } from "../../entity/Comment";
import { getRepository } from "typeorm";
import { validate } from "class-validator";


@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  @UseMiddleware(isAuth)
  async getAllComments() {
    const commentRepository = getRepository(Comment);
    const comments = await commentRepository.find();
    return comments;
  }

  @Query(() => Comment)
  @UseMiddleware(isAuth)
  async getCommentById(@Arg("id") id: string): Promise<Comment> {
    const commentRepository = getRepository(Comment);
    try {
      const comment = await commentRepository.findOneOrFail(id);
      return comment;
    } catch (error) {
      throw new Error("Comment not found");
    }
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async newComment(
    @Arg("id") id: string,
    @Arg("CommentInput") text: string,
  ): Promise<String> {
    const commentRepository = getRepository(Comment);
    let comment;
    try {
      comment = await commentRepository.findOneOrFail(id);
    } catch (error) {
      throw new Error("Comment not found");
    }
    comment.text = text;
    const errors = await validate(comment);
    if (errors.length > 0) {
      throw new Error("Sorry, something went wrong!");
    }
    try {
      await commentRepository.save(comment);
    } catch (e) {
      throw new Error("Sorry, something went wrong!");
    }
    return "Comment edited";
  }
}
