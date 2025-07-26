/*
 * StreamfinityTV Player script
 *
 * Handles playlist loading, parsing and video playback.
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('m3u-url');
  const loadButton = document.getElementById('load-url');
  const fileInput = document.getElementById('file-input');
  const channelList = document.getElementById('channel-list');
  const videoPlayer = document.getElementById('video-player');
  let channels = [];

  // Load playlist from remote URL
  loadButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      alert('Please enter a valid M3U or stream URL.');
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const text = await response.text();
      parseAndRender(text);
    } catch (err) {
      console.error(err);
      // If we cannot fetch or parse as M3U, fallback to single stream
      channels = [{ name: url, url }];
      renderChannelList();
    }
  });

  // Load playlist from local file
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      parseAndRender(text);
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  });

  // Parse M3U text and render channels
  function parseAndRender(text) {
    channels = parseM3U(text);
    if (channels.length === 0) {
      // fallback: treat as single direct stream
      const url = urlInput.value.trim();
      channels = [
        {
          name: url || 'Stream',
          url: url || text.trim(),
        },
      ];
    }
    renderChannelList();
  }

  // Parse M3U or M3U8 formatted text
  function parseM3U(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim());
    const parsed = [];
    let currentName = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        // Extract channel name after comma
        const parts = line.split(',');
        currentName = parts.length > 1
          ? parts.slice(1).join(',').trim()
          : 'Unnamed channel';
      } else if (!line.startsWith('#')) {
        // Found a URL line; pair with previously seen channel name if any
        const url = line;
        parsed.push({ name: currentName || url, url });
        currentName = '';
      }
    }
    return parsed;
  }

  // Render the channel list sidebar
  function renderChannelList() {
    channelList.innerHTML = '';
    const list = document.createElement('ul');
    channels.forEach((chan, index) => {
      const li = document.createElement('li');
      li.textContent = chan.name;
      li.dataset.index = index.toString();
      li.addEventListener('click', () => playChannel(index, li));
      list.appendChild(li);
    });
    channelList.appendChild(list);
    // Autoplay first channel by default
    if (channels.length > 0) {
      playChannel(0, list.firstChild);
    }
  }

  // Play a selected channel and highlight the active list item
  function playChannel(index, listItemElement) {
    const selected = channels[index];
    if (!selected) return;
    // Highlight active channel
    const lis = channelList.querySelectorAll('li');
    lis.forEach((li) => li.classList.remove('active'));
    if (listItemElement) listItemElement.classList.add('active');
    // Update the video source and play
    videoPlayer.src = selected.url;
    videoPlayer
      .play()
      .catch((err) => {
        console.error('Error playing video', err);
      });
  }
});