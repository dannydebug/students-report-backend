import Router from "koa-router";
import { Collection, ObjectID } from "mongodb";

export function loadRoutes(
  router: Router,
  schoolsCol: Collection,
  studentsCol: Collection
): void {
  // Get all schools
  router.get("/schools", async ctx => {
    const schools = await schoolsCol.find().toArray();
    ctx.body = schools;
  });

  // Get one school
  router.get("/schools/:id", async ctx => {
    const school = await schoolsCol.findOne({ _id: ctx.params.id });
    if (school === null) {
      return (ctx.status = 404);
    }
    ctx.body = school;
  });

  // Create a new school
  router.post("/schools", async ctx => {
    const result = await schoolsCol.insertOne({
      _id: new ObjectID().toHexString(),
      name: ctx.request.body.name
    });
    ctx.body = result.ops[0];
  });

  // Get all students for a specific school
  router.get("/schools/:id/students", async ctx => {
    const school = await schoolsCol.findOne({ _id: ctx.params.id });
    if (school === null) {
      return (ctx.status = 404);
    }
    const students = await studentsCol
      .find({ schoolId: ctx.params.id })
      .toArray();
    ctx.body = students;
  });

  // Get the csv report for all the students of a school
  router.get("/schools/:id/students.csv", async ctx => {
    const school = await schoolsCol.findOne({ _id: ctx.params.id });
    if (school === null) {
      return (ctx.status = 404);
    }
    const cursor = studentsCol.find({ schoolId: ctx.params.id });
    let studentsCsv = "name,surname,grade\n";
    await cursor.forEach(doc => {
      studentsCsv += `${doc.name},${doc.surname},${doc.grade}\n`;
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
}
