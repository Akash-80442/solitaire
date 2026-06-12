# Matchmaking Server

This is a lightweight Node.js Express server to facilitate matchmaking using 6-digit Room Codes instead of IP addresses. It allows the React Native app to exchange Local IP addresses seamlessly for 8-player peer-to-peer gameplay.

## Getting Started

1. Open a terminal in this `server` directory.
2. Install dependencies:
   ```bash
   npm install express cors
   ```
3. Start the server:
   ```bash
   node index.js
   ```
4. The server will run on `http://localhost:3000`.

## Connecting from Mobile App
If you are running the React Native app on an Android Emulator, it will connect to `http://10.0.2.2:3000` automatically.
If you are testing on real devices over WiFi, you should deploy this server (e.g. to Render, Heroku) or change `MATCHMAKING_SERVER_URL` in `src/utils/socketManager.ts` to the local IP of the computer running this server (e.g., `http://192.168.1.5:3000`).
