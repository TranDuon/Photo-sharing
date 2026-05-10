/**
 * dbLoad.js — Seed MongoDB với dữ liệu mẫu.
 * Chạy: npm run seed
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const User       = require("./userModel");
const Photo      = require("./photoModel");
const SchemaInfo = require("./schemaInfo");

/* ── Dữ liệu mẫu ── */
const seedUsers = [
  { first_name: "Ian",   last_name: "Malcolm",  location: "Austin, TX",   description: "Chaos theory enthusiast", occupation: "Mathematician", login_name: "ian",   password: "123456" },
  { first_name: "Ellie", last_name: "Sattler",  location: "Denver, CO",   description: "Palaeobotanist",          occupation: "Scientist",     login_name: "ellie", password: "123456" },
  { first_name: "Alan",  last_name: "Grant",    location: "Montana",      description: "Loves dinosaur fossils",  occupation: "Palaeontologist",login_name: "alan",  password: "123456" },
  { first_name: "John",  last_name: "Hammond",  location: "Isla Nublar",  description: "Theme park visionary",    occupation: "Entrepreneur",  login_name: "john",  password: "123456" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Xoá dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Photo.deleteMany({}),
    SchemaInfo.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Tạo users với mật khẩu đã hash
  const createdUsers = await Promise.all(
    seedUsers.map(async (u) => {
      const hash = await bcrypt.hash(u.password, 10);
      return User.create({ ...u, password: hash });
    })
  );
  console.log(`Created ${createdUsers.length} users`);

  // Tạo photos + comments
  const [ian, ellie, alan, john] = createdUsers;

  await Photo.create([
    {
      user_id: ian._id,
      file_name: "tree.jpg",
      caption: "Cây ven hồ, buổi sáng.",
      date_time: new Date("2024-01-15T10:30:00"),
      comments: [
        { comment: "Amazing shot!",         date_time: new Date("2024-01-16T08:00:00"), user_id: ellie._id },
        { comment: "Love the composition.", date_time: new Date("2024-01-17T12:00:00"), user_id: alan._id  },
      ],
    },
    {
      user_id: ian._id,
      file_name: "lake.jpg",
      date_time: new Date("2024-02-20T14:00:00"),
      comments: [],
    },
    {
      user_id: ellie._id,
      file_name: "mountain.jpg",
      date_time: new Date("2024-03-05T09:15:00"),
      comments: [
        { comment: "Gorgeous scenery!", date_time: new Date("2024-03-06T11:00:00"), user_id: ian._id },
      ],
    },
    {
      user_id: alan._id,
      file_name: "desert.jpg",
      date_time: new Date("2024-04-10T07:45:00"),
      comments: [
        { comment: "Feels like Jurassic Park!", date_time: new Date("2024-04-11T09:30:00"), user_id: john._id },
      ],
    },
  ]);
  console.log("Created photos with comments");

  // SchemaInfo
  await SchemaInfo.create({ __v: 0 });
  console.log("Created SchemaInfo");

  await mongoose.disconnect();
  console.log("Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
