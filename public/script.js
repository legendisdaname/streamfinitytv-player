/*
 * Frontend logic for StreamfinityTV Player
 *
 * Handles loading remote or local playlists via the backend proxy,
 * parsing M3U data, rendering the channel list, filtering by search
 * and playing selected streams in an HTML5 video element.
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('m3u-url');
  const loadButton = document.getElementById('load-url');
  const fileInput = document.getElementById('file-input');
  const searchInput = document.getElementById('search-channels');
  const channelListUl = document.getElementById('channels-ul');
  const videoPlayer = document.getElementById('video-player');

  let channels = [];
  let currentPlayingIndex = null;

  // Load remote playlist or direct stream URL
  loadButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      alert('Please enter a valid M3U or stream URL.');
      return;
    }
    // Determine if the URL points to an M3U file by its extension
    if (/\.m3u8?$|\.m3u$/i.test(url)) {
      try {
        const playlistText = await fetchPlaylist(url);
        channels = parseM3U(playlistText);
        if (channels.length === 0) {
          // If parsing fails, treat as a single stream
          channels = [{ name: url, url }];
        }
      } catch (err) {
        console.error(err);
        channels = [{ name: url, url }];
      }
    } else {
      // Direct streaming URL
      channels = [{ name: url, url }];
    }
    currentPlayingIndex = null;
    renderChannelList();
  });

  // Load playlist from a local file
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      channels = parseM3U(text);
      if (channels.length === 0) {
        // If file is not a playlist, use it as a direct stream if it's a video file
        channels = [
          {
            name: file.name,
            url: URL.createObjectURL(file),
          },
        ];
      }
      currentPlayingIndex = null;
      renderChannelList();
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  });

  // Filter channels by search query
  searchInput.addEventListener('input', () => {
    renderChannelList(searchInput.value.trim().toLowerCase());
  });

  /**
   * Fetch a remote playlist via the server proxy. Encodes the URL
   * parameter to avoid issues with special characters.
   * @param {string} url - The remote playlist URL
   * @returns {Promise<string>} The playlist content
   */
  async function fetchPlaylist(url) {
    const encoded = encodeURIComponent(url);
    const response = await fetch(`/api/playlist?url=${encoded}`);
    if (!response.ok) {
      throw new Error(`Failed to load playlist: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Parse M3U formatted text into an array of channel objects.
   * Each channel has a name and a streaming URL.
   * @param {string} text - Raw M3U content
   * @returns {Array<{name: string, url: string}>}
   */
  function parseM3U(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim());
    const parsed = [];
    let currentName = '';
    for (const line of lines) {
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        const parts = line.split(',');
        currentName = parts.length > 1
          ? parts.slice(1).join(',').trim()
          : 'Unnamed channel';
      } else if (!line.startsWith('#')) {
        const url = line;
        parsed.push({ name: currentName || url, url });
        currentName = '';
      }
    }
    return parsed;
  }

  /**
   * Render the channel list to the sidebar. Optionally filter by a
   * lowercase search query.
   * @param {string} [filter=''] - Lowercase search string to filter channel names
   */
  /**
   * Render the channel list to the sidebar. This implementation
   * uses incremental DOM updates in batches to keep the UI responsive
   * even with very large playlists. A loading message is displayed
   * while channels are being added.
   *
   * @param {string} [filter=''] - Lowercase search string to filter channel names
   */
  function renderChannelList(filter = '') {
    // Show a loading message while we build the list
    channelListUl.textContent = 'Loading channels…';
    // Determine which channel indices match the filter
    const filteredIndices = [];
    const lowerFilter = filter.toLowerCase();
    channels.forEach((chan, idx) => {
      if (!lowerFilter || chan.name.toLowerCase().includes(lowerFilter)) {
        filteredIndices.push(idx);
      }
    });
    // Reset the list and start incremental rendering
    channelListUl.innerHTML = '';
    let pointer = 0;
    const batchSize = 100;
    function addBatch() {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < batchSize && pointer < filteredIndices.length; i++, pointer++) {
        const idx = filteredIndices[pointer];
        const chan = channels[idx];
        const li = document.createElement('li');
        li.textContent = chan.name;
        li.dataset.index = String(idx);
        if (idx === currentPlayingIndex) {
          li.classList.add('active');
        }
        li.addEventListener('click', () => playChannel(idx));
        fragment.appendChild(li);
      }
      channelListUl.appendChild(fragment);
      if (pointer < filteredIndices.length) {
        // Schedule the next batch so the UI can update in between
        setTimeout(addBatch, 0);
      } else {
        // After finishing, auto-play the first visible channel if none is playing
        if (filteredIndices.length > 0 && currentPlayingIndex === null) {
          playChannel(filteredIndices[0]);
        }
      }
    }
    addBatch();
  }

  /**
   * Play a selected channel by index. Updates the video source and
   * highlights the active channel in the list.
   * @param {number} index - Index of the channel in the channels array
   */
  function playChannel(index) {
    const selected = channels[index];
    if (!selected) return;
    currentPlayingIndex = index;
    videoPlayer.src = selected.url;
    videoPlayer.play().catch((err) => {
      console.error('Error playing video', err);
    });
    // Update active state on list items
    document.querySelectorAll('#channels-ul li').forEach((li) => li.classList.remove('active'));
    const activeLi = document.querySelector(`#channels-ul li[data-index="${index}"]`);
    if (activeLi) activeLi.classList.add('active');
  }
});