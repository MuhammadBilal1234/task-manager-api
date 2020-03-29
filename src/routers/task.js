const express = require("express");
const Task = require("../models/tasks");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
    const task1 = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task1.save();
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});

// GET /task?comleted=true
// GET /task?limit=10&skip=2
// GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = part[1] === "desc" ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip)
                },
                sort
            })
            .execPopulate();
        res.status(200).send(req.user.tasks);
    } catch (e) {
        res.status(404).send();
    }
});

router.get("/tasks/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.send(500).send();
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["discription", "completed"];
    const isValidOperation = updates.every(update =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates" });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task) {
            res.status(404).send();
        }

        updates.forEach(update => (task[update] = req.body.params[update]));

        await task.save();

        res.send(task);
    } catch (e) {
        res.send(400).send(e);
    }
});

module.exports = router;
