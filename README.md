# StreamfinityTV Player

StreamfinityTV Player is a simple web‑based IPTV player that lets you load and watch live streams from M3U playlists or direct streaming URLs. The application runs entirely in your browser—no server‑side processing required and no extra plugins needed.

## Features

- **Remote playlists**: Enter the URL of an `.m3u` or `.m3u8` file and the player will fetch and parse the channel list (subject to CORS restrictions).
- **Local file support**: Upload a playlist file from your computer and the channels will appear instantly.
- **Channel listing**: Browse your loaded channels in a responsive sidebar. The first channel starts playing automatically.
- **Simple playback**: Click on any channel in the list to start playing its stream in the built‑in HTML5 video element.
- **Responsive design**: The layout adapts seamlessly to mobile and desktop screens.

## Getting started

1. Clone or download this repository to your local machine.
2. Open `index.html` in a modern web browser such as Chrome, Firefox, Edge or Safari.
3. To load a playlist:
   - Paste a remote `.m3u` or `.m3u8` URL in the input box and click **Load URL**.
   - Or click the file picker and choose a local playlist file from your computer.
4. Once loaded, the channels appear in the sidebar. Click any channel name to start streaming.

> **Important**: Many remote servers block cross‑origin requests by default. If the remote playlist fails to load, download it to your device and use the local file option instead.

## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests. Whether you add new features, improve the user interface or fix bugs, your help makes the project better for everyone.

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify and distribute this software as long as the original license is included.