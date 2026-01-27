const express = require('express');
const router = express.Router();

const { customAlphabet } = require('nanoid');
const { getRedis, getCurrentTime } = require('../config/redis');

// Generate short, URL-safe IDs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create a paste
router.post('/', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }

    // Validate ttl_seconds
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
      }
    }

    // Validate max_views
    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return res.status(400).json({ error: 'max_views must be an integer >= 1' });
      }
    }

    const redis = getRedis();
    const id = nanoid();
    const currentTime = getCurrentTime(req);

    // Create paste object
    const paste = {
      content,
      created_at: currentTime,
      views: 0
    };

    if (max_views !== undefined) {
      paste.max_views = max_views;
    }

    if (ttl_seconds !== undefined) {
      paste.expires_at = currentTime + (ttl_seconds * 1000);
    }

    // Store paste in Redis
    await redis.set(`paste:${id}`, JSON.stringify(paste));

    // Set TTL if specified (for automatic cleanup)
    if (ttl_seconds !== undefined) {
      await redis.expire(`paste:${id}`, ttl_seconds);
    }

    // Construct URL - use FRONTEND_URL for the paste view
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/p/${id}`;

    res.status(201).json({ id, url });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a paste by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const redis = getRedis();
    const currentTime = getCurrentTime(req);

    // Get paste from Redis
    const pasteData = await redis.get(`paste:${id}`);

    if (!pasteData) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = JSON.parse(pasteData);

    // Check if paste has expired (TTL)
    if (paste.expires_at && currentTime >= paste.expires_at) {
      // Delete expired paste
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    // Check if view limit reached
    if (paste.max_views !== undefined && paste.views >= paste.max_views) {
      // Delete paste that reached view limit
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    // Increment view count
    paste.views += 1;

    // Check if this view hits the limit
    if (paste.max_views !== undefined && paste.views >= paste.max_views) {
      // This was the last view, delete the paste
      await redis.del(`paste:${id}`);
    } else {
      // Update paste with new view count
      await redis.set(`paste:${id}`, JSON.stringify(paste));
    }

    // Prepare response
    const response = {
      content: paste.content,
      remaining_views: paste.max_views !== undefined ? paste.max_views - paste.views : null,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;