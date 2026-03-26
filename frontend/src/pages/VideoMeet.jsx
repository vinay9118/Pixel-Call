import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;

const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// --- Helper Component for Remote Videos ---
const VideoPlayer = ({ stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Remote play error:", e));
        }
    }, [stream]);

    return (
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
    );
};

export default function VideoMeetComponent() {
    const navigate = useNavigate();

    // --- Refs ---
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    const connectionsRef = useRef({});
    const localStreamRef = useRef();
    
    // --- State ---
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);

    // --- 1. Mounting ---
    useEffect(() => {
        getPermissions();
        // Cleanup on unmount
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const getPermissions = async () => {
        try {
            const videoPerm = await navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => true).catch(() => false);
            const audioPerm = await navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => true).catch(() => false);
            
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            if (videoPerm || audioPerm) {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: videoPerm, 
                    audio: audioPerm 
                });
                localStreamRef.current = stream;
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.play().catch(e => console.error("Local play error:", e));
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- 2. Track Handling ---
    const replaceTrack = (newTrack) => {
        if (localStreamRef.current) {
            const oldTrack = localStreamRef.current.getVideoTracks()[0];
            if (oldTrack) {
                localStreamRef.current.removeTrack(oldTrack);
                oldTrack.stop();
            }
            localStreamRef.current.addTrack(newTrack);
        }
        
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }

        for (let id in connectionsRef.current) {
            const senders = connectionsRef.current[id].getSenders();
            const sender = senders.find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(newTrack).catch(e => console.error("Track replacement failed:", e));
            }
        }
    };

    const handleVideo = () => {
        const newStatus = !video;
        setVideo(newStatus);
        if (newStatus) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => replaceTrack(stream.getVideoTracks()[0]))
                .catch(e => console.log(e));
        } else {
            replaceTrack(black());
        }
    };

    const handleScreen = () => {
        const newStatus = !screen;
        setScreen(newStatus);

        if (newStatus) {
            // --- START SHARING ---
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(stream => {
                        const screenTrack = stream.getVideoTracks()[0];

                        // Handler for browser's "Stop Sharing" UI
                        screenTrack.onended = () => {
                            setScreen(false); // Update React state
                            // Revert to camera or black
                            if (video) {
                                navigator.mediaDevices.getUserMedia({ video: true })
                                    .then(camStream => replaceTrack(camStream.getVideoTracks()[0]))
                                    .catch(e => console.error("Revert to cam failed:", e));
                            } else {
                                replaceTrack(black());
                            }
                        };

                        replaceTrack(screenTrack);
                    })
                    .catch(e => {
                        console.error("Screen share failed:", e);
                        setScreen(false); // Reset button state if cancelled
                    });
            }
        } else {
            // --- STOP SHARING (Button Click) ---
            // 1. Stop the screen track explicitly (removes browser recording icon)
            if (localStreamRef.current) {
                const screenTrack = localStreamRef.current.getVideoTracks()[0];
                if (screenTrack) screenTrack.stop();
            }

            // 2. Revert to Camera
            if (video) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => replaceTrack(stream.getVideoTracks()[0]))
                    .catch(e => console.error(e));
            } else {
                replaceTrack(black());
            }
        }
    };
    
    const handleAudio = () => {
        const newStatus = !audio;
        setAudio(newStatus);
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = newStatus);
        }
    };

    // --- 3. Socket & Connection Logic ---
    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('connect', () => {
            // FIX 1: Join a generic room name so localhost and IP addresses match
            // For production, use window.location.pathname
            socketRef.current.emit('join-call', window.location.pathname);
            
            socketIdRef.current = socketRef.current.id;
            
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('signal', gotMessageFromServer);

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                if(connectionsRef.current[id]) delete connectionsRef.current[id];
            });

            // FIX 2: Better Logic to avoid "Double Offer" crash
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if(socketListId !== socketIdRef.current) {
                        connectionsRef.current[socketListId] = new RTCPeerConnection(peerConfigConnections);
                        
                        // Add local tracks
                        if (localStreamRef.current) {
                            localStreamRef.current.getTracks().forEach(track => {
                                connectionsRef.current[socketListId].addTrack(track, localStreamRef.current);
                            });
                        }

                        // Handle ICE
                        connectionsRef.current[socketListId].onicecandidate = (event) => {
                            if (event.candidate) {
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };

                        // Handle Stream
                        connectionsRef.current[socketListId].ontrack = (event) => {
                            const remoteStream = event.streams[0];
                            setVideos(prev => {
                                if (prev.some(v => v.socketId === socketListId)) {
                                    return prev.map(v => v.socketId === socketListId 
                                        ? { ...v, stream: remoteStream, forceUpdate: Date.now() } 
                                        : v
                                    );
                                }
                                return [...prev, {
                                    socketId: socketListId,
                                    stream: remoteStream,
                                    autoplay: true,
                                    playsinline: true,
                                    forceUpdate: Date.now()
                                }];
                            });
                        };

                        // DECISION: Who creates the offer?
                        // If I am the new user (id === me), I create offers for everyone.
                        // If I am an existing user, I wait for the new user to send me an offer.
                        if (socketIdRef.current === id) {
                            console.log(`I am the new user ${id}. Initiating connection to ${socketListId}`);
                            connectionsRef.current[socketListId].createOffer()
                                .then(description => {
                                    connectionsRef.current[socketListId].setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'sdp': connectionsRef.current[socketListId].localDescription }));
                                        });
                                })
                                .catch(e => console.error(e));
                        }
                    }
                });
            });
        });
    };

    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);
        
        if (fromId !== socketIdRef.current) {
            // If we receive an offer but don't have a connection yet, create it
            if(!connectionsRef.current[fromId]) {
                 connectionsRef.current[fromId] = new RTCPeerConnection(peerConfigConnections);
                 
                 // Add tracks so we can send video back
                 if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => {
                        connectionsRef.current[fromId].addTrack(track, localStreamRef.current);
                    });
                }

                 connectionsRef.current[fromId].onicecandidate = (event) => {
                    if (event.candidate) {
                        socketRef.current.emit('signal', fromId, JSON.stringify({ 'ice': event.candidate }));
                    }
                };

                connectionsRef.current[fromId].ontrack = (event) => {
                    const remoteStream = event.streams[0];
                    setVideos(prev => {
                        if (prev.some(v => v.socketId === fromId)) {
                            return prev.map(v => v.socketId === fromId ? { ...v, stream: remoteStream, forceUpdate: Date.now() } : v);
                        }
                        return [...prev, {
                            socketId: fromId,
                            stream: remoteStream,
                            autoplay: true,
                            playsinline: true,
                            forceUpdate: Date.now()
                        }];
                    });
                };
            }

            if (signal.sdp) {
                connectionsRef.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === 'offer') {
                            connectionsRef.current[fromId].createAnswer()
                                .then(description => {
                                    connectionsRef.current[fromId].setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connectionsRef.current[fromId].localDescription }));
                                        });
                                });
                        }
                    }).catch(e => console.error(e));
            }
            if (signal.ice) {
                connectionsRef.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error(e));
            }
        }
    };

    // --- 4. Utilities ---
    const silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    const black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    // --- 5. UI Helpers ---
    const connect = () => {
        setAskForUsername(false);
        connectToSocketServer();
    };

    const handleEndCall = () => {
        try {
            if(localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if(socketRef.current) {
                socketRef.current.disconnect();
            }
        } catch (e) {
            console.error(e);
        }

        // --- SMART REDIRECT FIX ---
        if (localStorage.getItem("token")) {
            // User is Logged In -> Go to Dashboard
            navigate("/home");
        } else {
            // User is Guest -> Go to Landing Page
            navigate("/");
        }
    };

    const sendMessage = () => {
        if(message.trim() === "") return;
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages(prev => [...prev, { sender, data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages(prev => prev + 1);
        }
    };

    const updateLocalVideo = (node) => {
        localVideoRef.current = node;
        if (node && localStreamRef.current && node.srcObject !== localStreamRef.current) {
            node.srcObject = localStreamRef.current;
        }
    };

    return (
        <div className={styles.bodyBackground}>
            {askForUsername ? (
                <div className={styles.lobbyContainer}>
                    <h1>Join Video Call</h1>
                    <div className={styles.lobbyVideoContainer}>
                        <video ref={updateLocalVideo} autoPlay muted></video>
                    </div>
                    <div className={styles.lobbyForm}>
                        <TextField 
                            id="outlined-basic" 
                            label="Username" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            variant="outlined" 
                        />
                        <Button variant="contained" onClick={connect}>Connect</Button>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    
                    {/* Remote Videos Grid */}
                    <div className={styles.conferenceView}>
                        {videos.length > 0 ? (
                            videos.map((video) => (
                                <div key={video.socketId} className={styles.remoteVideoContainer}>
                                    <VideoPlayer key={video.forceUpdate} stream={video.stream} />
                                </div>
                            ))
                        ) : (
                            <div className={styles.waitingMessage}>
                                <h3>Waiting for others...</h3>
                            </div>
                        )}
                    </div>

                    {/* Local Video (PiP) */}
                    <div className={styles.localVideoWrapper}>
                         <video className={styles.meetUserVideo} ref={updateLocalVideo} autoPlay muted></video>
                         <span className={styles.userLabel}>You</span>
                    </div>

                    {/* Controls */}
                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: !video ? "red" : "white", backgroundColor: !video ? "#ff0000ff" : "transparent" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        
                        <IconButton onClick={handleAudio} style={{ color: !audio ? "red" : "white", backgroundColor: !audio ? "#ff0000ff" : "transparent" }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} style={{ color: "red", backgroundColor: "#f40808ff" }}>
                            <CallEndIcon />
                        </IconButton>

                        {screenAvailable && (
                            <IconButton onClick={handleScreen} style={{ color: screen ? "#8ab4f8" : "white" }}>
                                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton>
                        )}

                        <Badge badgeContent={newMessages} max={999} color="warning">
                            <IconButton onClick={() => { setModal(!showModal); setNewMessages(0); }} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    {/* Chat Modal */}
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <div className={styles.chatHeader}>
                                    <h3>In-call messages</h3>
                                    <Button onClick={() => setModal(false)}>Close</Button>
                                </div>
                                <div className={styles.chattingDisplay}>
                                    {messages.length > 0 ? messages.map((item, index) => (
                                        <div className={styles.messageBlock} key={index}>
                                            <p className={styles.senderName}>{item.sender}</p>
                                            <p className={styles.messageText}>{item.data}</p>
                                        </div>
                                    )) : <p style={{textAlign:'center', marginTop:'50px', color:'#999'}}>No messages yet</p>}
                                </div>
                                <div className={styles.chattingArea}>
                                    <TextField 
                                        value={message} 
                                        onChange={e => setMessage(e.target.value)} 
                                        placeholder="Send a message" 
                                        variant="outlined" 
                                        fullWidth
                                        size="small"
                                    />
                                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}