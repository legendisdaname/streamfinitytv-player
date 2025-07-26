/**
 * Entry point for the StreamfinityTV Player backend.
 *
 * This small Express server proxies remote playlist requests to avoid
 * client‑side CORS restrictions and serves the static frontend files
 * from the `public` directory. Running this server allows the
 * application to fetch and parse M3U playlists from external hosts.
 */

const express = require('express');
const cors = require('cors');
// Dynamically import node-fetch to keep compatibility with CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static assets from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Proxy endpoint for fetching remote M3U playlists. Pass a URL
 * as a query parameter (`/api/playlist?url=...`) and the server
 * will fetch the content and return it as plain text. This avoids
 * browser CORS restrictions when fetching playlists from third‑party
 * servers.
 */
app.get('/api/playlist', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Failed to fetch playlist: ${response.statusText}` });
    }
    const text = await response.text();
    res.type('text/plain').send(text);
  } catch (err) {
    console.error('Error fetching remote playlist:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Proxy endpoint that fetches a remote M3U playlist and returns a parsed
 * JSON array of channel objects. Each object has a `name` and `url`. This
 * moves the heavy parsing work off of the browser thread and onto the server.
 * To use it, call `/api/playlistjson?url=<encoded URL>` from the frontend.
 */
app.get('/api/playlistjson', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Failed to fetch playlist: ${response.statusText}` });
    }
    const text = await response.text();
    // Parse M3U into channel objects
    const lines = text.split(/\r?\n/);
    const channels = [];
    let currentName = '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        const parts = line.split(',');
        currentName = parts.length > 1
          ? parts.slice(1).join(',').trim()
          : 'Unnamed channel';
      } else if (!line.startsWith('#')) {
        const streamUrl = line;
        channels.push({ name: currentName || streamUrl, url: streamUrl });
        currentName = '';
      }
    }
    res.json(channels);
  } catch (err) {
    console.error('Error fetching or parsing remote playlist:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`StreamfinityTV server running at http://localhost:${PORT}`);
});