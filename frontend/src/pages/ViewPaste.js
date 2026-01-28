import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewPaste.css';

const ViewPaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        // HARDCODED URL - NO CONFIG FILE!
        const response = await fetch(`https://pastebin-lite-apht.onrender.com/api/pastes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch paste');
        }

        setPaste(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paste.content);
      alert('Content copied to clipboard!');
    } catch (err) {
      alert('Failed to copy content');
    }
  };

  const handleRaw = () => {
    const blob = new Blob([paste.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="view-paste-container">
        <div className="loading">Loading paste...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-paste-container">
        <div className="error-card">
          <h2>❌ Paste Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="home-btn">
            Create New Paste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-paste-container">
      <div className="view-paste-card">
        <div className="paste-header">
          <h1>📋 Paste Content</h1>
          <button onClick={() => navigate('/')} className="new-paste-btn">
            Create New
          </button>
        </div>

        <div className="paste-metadata">
          {paste.remaining_views !== null && (
            <span className="metadata-item">
              👁️ Remaining Views: {paste.remaining_views}
            </span>
          )}
          {paste.expires_at && (
            <span className="metadata-item">
              ⏰ Expires: {new Date(paste.expires_at).toLocaleString()}
            </span>
          )}
        </div>

        <div className="paste-content">
          <pre>{paste.content}</pre>
        </div>

        <div className="paste-actions">
          <button onClick={handleCopy} className="action-btn">
            📋 Copy
          </button>
          <button onClick={handleRaw} className="action-btn">
            📄 Raw
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPaste;