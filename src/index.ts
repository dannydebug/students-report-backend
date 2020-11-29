import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import cors from "@koa/cors";
import { MongoClient } from "mongodb";

import { loadRoutes } from "./routes";

async function main() {
  const app = new Koa();
  const router = new Router();

  const dbUrl = process.env.MONGO_URL || "";
  const client = await MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db = client.db();
  const schoolsCol = db.collection("schools");
  const studentsCol = db.collection("students");

  loadRoutes(router, schoolsCol, studentsCol);

  app
    .use(cors())
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

  const port = process.env.PORT;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
