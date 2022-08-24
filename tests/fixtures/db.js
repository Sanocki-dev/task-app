const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Michael Sanocki",
  email: "sanocki1234@hotmail.ca",
  password: "Mi123456",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Taylor Vandorp",
  email: "taylor@example.com",
  password: "ta123456",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "My First Task",
  owner: userOneId,
};
const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "My Second Task",
  owner: userOneId,
  completed: true,
};
const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "My Third Task",
  owner: userTwoId,
};

const authorization = "Bearer " + userOne.tokens[0].token;

const configureDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  
  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userTwoId,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  authorization,
  configureDatabase,
};
