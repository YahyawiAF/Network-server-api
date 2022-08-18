import { graphql, GraphQLSchema } from "graphql";

import { generateSchema } from "../modules/createSchema";

interface Options {
  source: string;
  variableValues?:any
}

let schema: GraphQLSchema;

export const gCall = async ({ source, variableValues }: Options) => {
  if (!schema) {
    schema = await generateSchema();
  }
  return graphql({
    schema,
    source,
    variableValues
  });
};
