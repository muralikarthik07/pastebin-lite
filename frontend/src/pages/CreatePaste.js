import React, { useState } from 'react';
import './CreatePaste.css';

const API_BASE =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CreatePaste = () => {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const payload = { content };
    if (ttl) payload.ttl_seconds = parseInt(ttl);
    if (maxViews) payload.max_views = parseInt(maxViews);

    try {
      const response = await fetch(`${API_BASE}/api/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      // 🔴 IMPORTANT: check before parsing JSON
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create paste');
      }
      
      const data = await response.json();


      setResult(data);
      setContent('');
      setTtl('');
      setMaxViews('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      alert('URL copied to clipboard!');
    } catch (err) {
      alert('Failed to copy URL');
    }
  };

  return (
    <div className="create-paste-container">
      <div className="create-paste-card">
        <h1>📋 Pastebin Lite</h1>
        <p className="subtitle">Share text snippets with optional expiry and view limits</p>

        <form onSubmit={handleSubmit}>
          <textarea
            className="paste-textarea"
            placeholder="Paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="options-grid">
            <div className="option-group">
              <label htmlFor="ttl">⏱️ Time to Live (seconds)</label>
              <input
                type="number"
                id="ttl"
                min="1"
                placeholder="Optional"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
              />
              <span className="helper-text">Leave empty for no expiry</span>
            </div>

            <div className="option-group">
              <label htmlFor="maxViews">👁️ Maximum Views</label>
              <input
                type="number"
                id="maxViews"
                min="1"
                placeholder="Optional"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
              />
              <span className="helper-text">Leave empty for unlimited views</span>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>

        {result && (
          <div className="result-box">
            <h3>✅ Paste Created Successfully!</h3>
            <div className="url-container">
              <div className="url-display">{result.url}</div>
              <button onClick={handleCopy} className="copy-btn">
                Copy
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePaste;