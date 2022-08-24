const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");

const {
  configureDatabase,
  authorization,
  taskOne,
  userTwo,
} = require("./fixtures/db");

beforeEach(configureDatabase);

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks

test("should create a task for a user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", authorization)
    .send({
      description: "Do the dishes",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test("should get users tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", authorization)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test("should get users completed tasks", async () => {
  const response = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", authorization)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);
});

test("should not delete other users tasks", async () => {
  const response = await request(app)
    .delete("/tasks/" + taskOne._id)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
