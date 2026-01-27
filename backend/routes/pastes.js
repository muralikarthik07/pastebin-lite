const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const { getRedis, getCurrentTime } = require('../config/redis');

// Generate short, URL-safe IDs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create a paste - POST /api/pastes
router.post('/', async (req, res) => {
  console.log('📝 Creating new paste...');
  console.log('Request body:', req.body);
  
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log('❌ Validation failed: Invalid content');
      return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }

    // Validate ttl_seconds
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        console.log('❌ Validation failed: Invalid TTL');
        return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
      }
    }

    // Validate max_views
    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        console.log('❌ Validation failed: Invalid max_views');
        return res.status(400).json({ error: 'max_views must be an integer >= 1' });
      }
    }

    const redis = getRedis();
    const id = nanoid();
    const currentTime = getCurrentTime(req);

    console.log(`✅ Generated ID: ${id}`);

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

    console.log('💾 Saving to Redis...');
    
    // Store paste in Redis
    await redis.set(`paste:${id}`, JSON.stringify(paste));

    // Set TTL if specified (for automatic cleanup)
    if (ttl_seconds !== undefined) {
      await redis.expire(`paste:${id}`, ttl_seconds);
      console.log(`⏰ Set TTL: ${ttl_seconds} seconds`);
    }

    // Construct URL - use FRONTEND_URL for the paste view
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/p/${id}`;

    console.log(`✅ Paste created successfully: ${url}`);

    res.status(201).json({ id, url });
  } catch (error) {
    console.error('❌ Error creating paste:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get a paste by ID - GET /api/pastes/:id
router.get('/:id', async (req, res) => {
  console.log(`👁️ Fetching paste: ${req.params.id}`);
  
  try {
    const { id } = req.params;
    const redis = getRedis();
    const currentTime = getCurrentTime(req);

    // Get paste from Redis
    const pasteData = await redis.get(`paste:${id}`);

    if (!pasteData) {
      console.log(`❌ Paste not found: ${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = JSON.parse(pasteData);

    // Check if paste has expired (TTL)
    if (paste.expires_at && currentTime >= paste.expires_at) {
      console.log(`⏰ Paste expired: ${id}`);
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    // Check if view limit reached
    if (paste.max_views !== undefined && paste.views >= paste.max_views) {
      console.log(`👁️ View limit reached: ${id}`);
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    // Increment view count
    paste.views += 1;
    console.log(`📊 View count: ${paste.views}/${paste.max_views || '∞'}`);

    // Check if this view hits the limit
    if (paste.max_views !== undefined && paste.views >= paste.max_views) {
      console.log(`🗑️ Deleting paste (last view): ${id}`);
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

    console.log(`✅ Paste retrieved successfully: ${id}`);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching paste:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;