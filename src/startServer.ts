import "reflect-metadata";
import "dotenv/config";

import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import { generateSchema } from "./modules/createSchema";
import { createTypeormConn } from "./utils/createTypeormConn";
import { graphqlUploadExpress } from "graphql-upload";
import * as cors from "cors";

var bodyParser = require("body-parser");
export const startServer = async () => {
  try {
    await createTypeormConn();
  } catch (err) {
    console.log("error", err);
  }

  const schema = await generateSchema();
  const appoloServer = new ApolloServer({
    uploads: false,
    schema,
    context: ({ req, res }) => ({ req, res }),
  });
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    graphqlUploadExpress({
      maxFileSize: 1000000,
      maxFiles: 20,
    })
  );
  var corsOptions = {
    origin: "http://localhost:5000",
    credentials: true,
  };
  app.use(cors(corsOptions));

  appoloServer.applyMiddleware({
    app,
  });
  app.listen(4202, () => {
    console.log("express server started");
  });
};
