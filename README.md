# StreamfinityTV Player

StreamfinityTV Player is a complete IPTV application that lets you load and watch live streams from M3U playlists or direct streaming URLs.  It consists of a lightweight Node.js backend that proxies remote playlist requests to bypass browser CORS restrictions and a responsive frontend built with HTML, CSS and vanilla JavaScript.

The backend allows the browser to fetch remote `.m3u` or `.m3u8` files from hosts that don’t enable CORS.  Without this proxy the browser often can’t access external playlists directly.  The frontend provides a clean channel list with search, supports uploading local playlist files, and plays streams in an HTML5 video element.

## Features

- **Proxy for remote playlists** – The Node.js backend exposes an API endpoint (`/api/playlist`) that fetches remote playlist URLs on your behalf and returns the raw text, bypassing CORS issues.
- **Remote and direct streams** – Enter the URL of a remote `.m3u` or `.m3u8` file or a direct streaming URL and click **Load URL** to start watching.
- **Local file support** – Upload a local playlist file from your computer and the channels will appear instantly.
- **Channel list with search** – Channels are displayed in a sidebar. A search box lets you filter channel names on the fly.
- **Auto‑play and navigation** – The first channel auto‑plays by default. Click any channel to start streaming it. The active channel is highlighted.
- **Responsive UI** – The layout adapts seamlessly to different screen sizes, making it usable on mobile and desktop.

## Getting started

1. Clone or download this repository and navigate into the project folder:

   ```bash
   git clone https://github.com/your-username/streamfinitytv-player.git
   cd streamfinitytv-player
   ```

2. Install the dependencies and start the server:

   ```bash
   npm install
   npm start
   ```

3. Open your browser and go to [http://localhost:3000](http://localhost:3000). You should see the StreamfinityTV Player interface.

4. To load a playlist:

   - Paste a remote `.m3u` or `.m3u8` URL (or a direct streaming URL) into the input box and click **Load URL**.
   - Or click the file picker and choose a local playlist file from your computer.

5. Use the search box to filter channels. Click any channel name to start streaming.

## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests. Whether you add new features, improve the user interface or fix bugs, your help makes the project better for everyone.

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify and distribute this software as long as the original license is included.