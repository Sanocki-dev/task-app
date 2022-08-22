const express = require("express");
require("./db/mongoose"); // File runs which connects mongoose to db
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

app.use(express.json()); // Automatically parses incoming data to json

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server started on port " + port);
});
