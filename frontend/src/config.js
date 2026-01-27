// API Configuration
// Remove any trailing spaces or slashes
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_URL = apiUrl.trim().replace(/\/+$/, '');