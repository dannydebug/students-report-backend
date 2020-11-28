import dotenv from "dotenv";
dotenv.config();

import faker from "faker";
import { MongoClient, ObjectID } from "mongodb";

const schoolNames = [
  "Autonomous University of Barcelona",
  "Pompeu Fabra University",
  "University of Barcelona",
  "Open University of Catalonia",
  "Esade",
  "Ramon Llul University"
];

function generateSchools() {
  const schools = [];
  for (const schoolName of schoolNames) {
    schools.push({
      _id: new ObjectID().toHexString(),
      name: schoolName
    });
  }
  return schools;
}

function generateStudents(num: number, schools: Array<{ _id: string }>) {
  const students = [];
  for (let i = 0; i < num; i++) {
    students.push({
      _id: new ObjectID().toHexString(),
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      grade: faker.random.number({ max: 100 }),
      schoolId: faker.random.arrayElement(schools)._id
    });
  }
  return students;
}

async function seed() {
  const url = process.env.MONGO_URL || "";
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db = client.db();
  const schoolsCol = db.collection("schools");
  const studentsCol = db.collection("students");

  const schools = generateSchools();
  const students = generateStudents(100, schools);

  await schoolsCol.insertMany(schools);
  await studentsCol.insertMany(students);

  await client.close();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
