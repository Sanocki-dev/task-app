const express = require("express");
const router = new express.Router();

const Task = require("../models/task");
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user.id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET /tasks?completed=Boolean
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt_asc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed;
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy?.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: req.query.limit,
        skip: req.query.skip,
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!task) {
      return res.status(404).send({ Error: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const allowedUpdates = ["completed", "description"];
  const updates = Object.keys(req.body); // Gets the keys that are being updated

  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ Error: "Body contains invalid keys" });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!task) {
      return res.status(404).send({ Error: "Task not found" });
    }

    updates.forEach((key) => {
      task[key] = req.body[key];
    });

    task.save();

    res.status(200).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!task) {
      res.status(404).send({ Error: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
