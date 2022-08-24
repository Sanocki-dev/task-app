const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {
  configureDatabase,
  userOne,
  userOneId,
  authorization,
} = require("./fixtures/db");

beforeEach(configureDatabase);

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Mike",
      email: "sanockimike1234@gmail.com",
      password: "Mi123456",
    })
    .expect(201);

  // Makes sure that the user was added to the database
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Makes sure the body contains the right values
  expect(response.body).toMatchObject({
    user: {
      name: "Mike",
      email: "sanockimike1234@gmail.com",
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("Mi123456");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);

  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "123@hotmail.com",
      passord: "Mi123456",
    })
    .expect(400);
});

test("should fetch users profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", authorization)
    .send()
    .expect(200);
});

test("should not fetch users profile", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("should delete users account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", authorization)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("should not delete users account", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("should upload user avatar", async () => {
  await request(app)
    .post("/user/me/avatar")
    .set("Authorization", authorization)
    .attach("avatar", "tests/fixtures/avatar.jpg")
    .expect(200);

  const user = await User.findById(userOneId);

  // Just checks if the type coming back is a buffer
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", authorization)
    .send({
      name: "Timmy Turner",
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe("Timmy Turner");
});

test("should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", authorization)
    .send({
      location: "Ontario",
    })
    .expect(400);
});
