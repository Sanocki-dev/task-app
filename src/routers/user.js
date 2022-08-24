const express = require("express");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const auth = require("../middleware/auth");
const User = require("../models/user");

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    // Generates JWT for this new user
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    // Generates JWT for this user
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    const { user, token } = req;
    user.tokens = user.tokens.filter((current) => current.token !== token);
    await user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    const { user } = req;

    user.tokens = [];
    await user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// router.get("/users/:id", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send({ Error: "User not found" });
//     }
//     res.status(200).send(user);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body); // Gets the keys that are being updated
  const allowedUpdates = ["name", "email", "password", "age"];

  // Looks at all the update keys and makes sure they are valid
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ Error: "Body contains invalid keys" });
  }

  try {
    // Has to be like this in order not to skip the password middleware
    updates.forEach((key) => (req.user[key] = req.body[key]));

    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

const upload = multer({
  // dest: "avatar", // Removing this makes it so you can get the buffer
  limits: {
    fileSize: 1000000, // 1 MB file size limit
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload a image"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // Reformats the photo to png and resizes it
    const buffer = await sharp(req.file.buffer)
      .resize(250, 250)
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ Success: "Avatar uploaded!" });
  },
  // Handles uncaught errors you need all 4 args
  (error, req, res, next) => {
    res.status(400).send({ Error: error.message });
  }
);

router.delete("/user/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send({ Success: "Avatar Deleted" });
});

router.get("/user/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    // Set this because by default its application/json
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send({ Error: "Image not found" });
  }
});

module.exports = router;
