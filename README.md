<div align="center">

#  Pixel-Call

**A modern, full-stack video conferencing application.**
<br>
Connect seamlessly with real-time video, audio, and chat communication.

<!-- Badges -->
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)

</div>

---

##  Overview

**Pixel-Call** is a web-based video meeting platform built to facilitate seamless communication. Whether on a laptop, tablet, or mobile phone, users can create rooms, join meetings, share screens, and chat in real-time.

The application utilizes **WebRTC** for peer-to-peer media streaming and **Socket.IO** for robust signaling and real-time messaging.

---

##  Features

- **Real-time Video & Audio:** High-quality, low-latency streaming using WebRTC mesh topology.
- **Fully Responsive:** Adaptive layout that works on Desktops, Tablets, and Mobile phones.
- **Screen Sharing:** Share your entire screen or specific windows with other participants.
- **In-Call Chat:** Real-time messaging with distinct styles for sender and receiver.
- **Media Controls:** Mute/Unmute audio and Toggle Video On/Off.
- **Meeting Lobby:** Preview your camera before joining the call.
- **Easy Invites:** Copy the meeting URL to invite others.

---

## Tech Stack

### Frontend
| Technology | Usage |
| :--- | :--- |
| **React.js** | Component-based UI architecture. |
| **Material UI** | Icons and form elements. |
| **CSS Modules** | Scoped, responsive styling. |
| **Socket.IO Client** | Real-time event handling. |

### Backend
| Technology | Usage |
| :--- | :--- |
| **Node.js** | Runtime environment. |
| **Express** | Server framework. |
| **Socket.IO** | Signaling (handshake) and room management. |

### Core Protocols
* **WebRTC:** `RTCPeerConnection` for direct media streams.
* **ICE Candidates:** Handling network traversal (STUN servers).

---

##  Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* `Node.js`
* `npm`

### 1. Clone the Repository
```bash
git clone https://github.com/vinay9118/Pixel-Call
cd Pixel-Call
```

### 2. Backend Setup
Navigate to the server directory:
```bash
cd backend
npm install
npm run dev
```
*The server typically runs on port `8000`.*

### 3. Frontend Setup
Open a new terminal and navigate to the client directory:
```bash
cd frontend
npm install
```

### 4. Configuration (Crucial for Mobile/LAN testing)
To allow devices on the same Wi-Fi (like your phone) to connect, you must use your computer's local IP address instead of `localhost`.

1. Find your IPv4 Address (Run `ipconfig` on Windows or `ifconfig` on Mac/Linux).
2. Open `src/environment.js` (or wherever your server URL is defined).
3. Update the URL:

```javascript
// Change http://localhost:8000 to your specific IP:
const server = "[http://192.168.1.](http://192.168.1.)X:8000"; 
export default server;
```

### 5. Run the Frontend
```bash
npm run start
```
*The application will open at `http://localhost:3000`.*

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

##  License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Created by [Vinay](https://github.com/vinay9118)**

</div>
