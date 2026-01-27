import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './ViewPaste.css';

const ViewPaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pastes/${id}`);

        if (!response.ok) {
          throw new Error('Paste not found');
        }

        const data = await response.json();
        setPaste(data);
      } catch (err) {
        setError(true);
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

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const getTimeLeft = () => {
    if (!paste.expires_at) return null;
    const expiresDate = new Date(paste.expires_at);
    const now = new Date();
    const timeLeft = Math.max(0, Math.floor((expiresDate - now) / 1000));
    return formatTime(timeLeft);
  };

  if (loading) {
    return (
      <div className="view-paste-container">
        <div className="view-paste-card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading paste...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-paste-container">
        <div className="view-paste-card">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h2>Paste Not Found</h2>
            <p>This paste may have expired, reached its view limit, or never existed.</p>
            <button onClick={() => navigate('/')} className="back-btn">
              Create New Paste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-paste-container">
      <div className="view-paste-card">
        <div className="header">
          <h1>📋 Pastebin Lite</h1>
          <button onClick={() => navigate('/')} className="link-btn">
            ← Create New Paste
          </button>
        </div>

        <div className="info-bar">
          <div className="info-item">
            👁️ Remaining views:{' '}
            <strong>
              {paste.remaining_views !== null ? paste.remaining_views : 'Unlimited'}
            </strong>
          </div>
          <div className="info-item">
            ⏱️ Expires:{' '}
            <strong>
              {paste.expires_at ? getTimeLeft() : 'Never'}
            </strong>
          </div>
        </div>

        <div className="content-area">
          <pre className="paste-content">{paste.content}</pre>
          <div className="actions">
            <button onClick={handleCopy} className="action-btn">
              Copy to Clipboard
            </button>
            <button onClick={handleRaw} className="action-btn">
              View Raw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPaste;