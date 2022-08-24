const express = require("express");
require("./db/mongoose"); // File runs which connects mongoose to db
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

app.use(express.json()); // Automatically parses incoming data to json

app.use(userRouter);
app.use(taskRouter);

module.exports = app