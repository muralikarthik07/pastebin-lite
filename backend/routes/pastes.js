const express = require("express");
const router = express.Router();
const { getRedis } = require("../config/redis");
const crypto = require("crypto");

// CREATE PASTE
router.post("/", async (req, res) => {
  try {
    const { content, expiresIn } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const redis = getRedis();
    const id = crypto.randomBytes(4).toString("hex");

    // Default expiry: 1 hour
    const ttl = expiresIn ? Number(expiresIn) : 3600;

    await redis.set(`paste:${id}`, content, "EX", ttl);

    // 🔴 IMPORTANT: ALWAYS RETURN JSON
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create paste" });
  }
});

// GET PASTE
router.get("/:id", async (req, res) => {
  try {
    const redis = getRedis();
    const content = await redis.get(`paste:${req.params.id}`);

    if (!content) {
      return res.status(404).json({ error: "Paste not found" });
    }

    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch paste" });
  }
});

module.exports = router;
