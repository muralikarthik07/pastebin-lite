const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const { getRedis, getCurrentTime } = require('../config/redis');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create paste
router.post('/', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content required' });
    }

    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return res.status(400).json({ error: 'Invalid ttl_seconds' });
    }

    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
      return res.status(400).json({ error: 'Invalid max_views' });
    }

    const redis = getRedis();
    const id = nanoid();
    const currentTime = getCurrentTime(req);

    const paste = {
      content,
      created_at: currentTime,
      views: 0
    };

    if (max_views !== undefined) paste.max_views = max_views;
    if (ttl_seconds !== undefined) paste.expires_at = currentTime + (ttl_seconds * 1000);

    await redis.set(`paste:${id}`, JSON.stringify(paste));
    if (ttl_seconds !== undefined) await redis.expire(`paste:${id}`, ttl_seconds);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/p/${id}`;

    res.status(201).json({ id, url });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get paste
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const redis = getRedis();
    const currentTime = getCurrentTime(req);

    const pasteData = await redis.get(`paste:${id}`);
    if (!pasteData) return res.status(404).json({ error: 'Paste not found' });

    const paste = JSON.parse(pasteData);

    if (paste.expires_at && currentTime >= paste.expires_at) {
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    if (paste.max_views !== undefined && paste.views >= paste.max_views) {
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    paste.views += 1;

    if (paste.max_views !== undefined && paste.views >= paste.max_views) {
      await redis.del(`paste:${id}`);
    } else {
      await redis.set(`paste:${id}`, JSON.stringify(paste));
    }

    res.json({
      content: paste.content,
      remaining_views: paste.max_views !== undefined ? paste.max_views - paste.views : null,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
    });
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;