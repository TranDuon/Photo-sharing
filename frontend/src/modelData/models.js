/**
 * Photo App Model Data
 * Hardcoded fake data used in Problem 1 (before server fetching in Problem 2).
 */

const users = [
  {
    _id: "57231f1a30e4351f4e9f4bd7",
    first_name: "Ian",
    last_name: "Malcolm",
    location: "Austin, TX",
    description: "Chaos theory enthusiast",
    occupation: "Mathematician",
  },
  {
    _id: "57231f1a30e4351f4e9f4bd8",
    first_name: "Ellie",
    last_name: "Sattler",
    location: "Denver, CO",
    description: "Palaeobotanist",
    occupation: "Scientist",
  },
  {
    _id: "57231f1a30e4351f4e9f4bd9",
    first_name: "Alan",
    last_name: "Grant",
    location: "Montana",
    description: "Loves dinosaur fossils",
    occupation: "Palaeontologist",
  },
  {
    _id: "57231f1a30e4351f4e9f4bda",
    first_name: "John",
    last_name: "Hammond",
    location: "Isla Nublar",
    description: "Theme park visionary",
    occupation: "Entrepreneur",
  },
];

const photos = [
  {
    _id: "p001",
    user_id: "57231f1a30e4351f4e9f4bd7",
    file_name: "tree.jpg",
    date_time: "2024-01-15T10:30:00",
    comments: [
      {
        _id: "c001",
        photo_id: "p001",
        date_time: "2024-01-16T08:00:00",
        comment: "Amazing shot!",
        user: users[1],
      },
      {
        _id: "c002",
        photo_id: "p001",
        date_time: "2024-01-17T12:00:00",
        comment: "Love the composition.",
        user: users[2],
      },
    ],
  },
  {
    _id: "p002",
    user_id: "57231f1a30e4351f4e9f4bd7",
    file_name: "lake.jpg",
    date_time: "2024-02-20T14:00:00",
    comments: [],
  },
  {
    _id: "p003",
    user_id: "57231f1a30e4351f4e9f4bd8",
    file_name: "mountain.jpg",
    date_time: "2024-03-05T09:15:00",
    comments: [
      {
        _id: "c003",
        photo_id: "p003",
        date_time: "2024-03-06T11:00:00",
        comment: "Gorgeous scenery!",
        user: users[0],
      },
    ],
  },
  {
    _id: "p004",
    user_id: "57231f1a30e4351f4e9f4bd9",
    file_name: "desert.jpg",
    date_time: "2024-04-10T07:45:00",
    comments: [
      {
        _id: "c004",
        photo_id: "p004",
        date_time: "2024-04-11T09:30:00",
        comment: "Feels like Jurassic Park!",
        user: users[3],
      },
    ],
  },
];

const schemaInfo = {
  _id: "schema001",
  __v: 0,
  load_date_time: "2024-01-01T00:00:00Z",
};

const models = {
  userListModel: () => users,
  userModel: (userId) => users.find((u) => u._id === userId) || null,
  photoOfUserModel: (userId) => photos.filter((p) => p.user_id === userId),
  schemaInfo: () => schemaInfo,
};

export default models;
