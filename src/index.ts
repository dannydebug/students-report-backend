import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import cors from "@koa/cors";
import { MongoClient, ObjectID } from "mongodb";

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

  // Create a new school
  // router.post("/schools", async ctx => {
  //   const result = await schoolsCol.insertOne({
  //     _id: new ObjectID().toHexString(),
  //     name: ctx.request.body.name
  //   });
  //   ctx.body = result.ops[0];
  // });

  router.get("/schools", async ctx => {
    const schools = await schoolsCol.find().toArray();
    ctx.body = schools;
  });

  // Get all students for a specific school
  router.get("/schools/:id/students", async ctx => {
    const students = await studentsCol
      .find({ schoolId: ctx.params.id })
      .toArray();
    ctx.body = students;
  });

  // Get the csv of all the students of a school
  router.get("/schools/:id/students.csv", async ctx => {
    const cursor = studentsCol.find({ schoolId: ctx.params.id });
    let studentsCsv = "name,surname,grade\n";
    await cursor.forEach(doc => {
      studentsCsv = studentsCsv + `${doc.name},${doc.surname},${doc.grade}\n`;
    });
    ctx.set("Content-Disposition", "attachment;filename=studentsReport.csv");
    ctx.body = studentsCsv;
  });

  // Get all students
  router.get("/students", async ctx => {
    const students = await studentsCol.find().toArray();
    ctx.body = students;
  });

  // Create one student for a specific university
  router.post("/students", async ctx => {
    const result = await studentsCol.insertOne({
      _id: new ObjectID().toHexString(),
      name: ctx.request.body.name,
      surname: ctx.request.body.surname,
      grade: ctx.request.body.grade,
      schoolId: ctx.request.body.schoolId
    });
    ctx.body = result.ops[0];
  });

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
