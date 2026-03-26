import { Server } from "socket.io";

const messages = new Map();
let connections = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED:", socket.id);

        socket.on("join-call", (path) => {
            socket.join(path);
            socket.roomId = path;

            const clients = Array.from(io.sockets.adapter.rooms.get(path) || []);

            io.in(path).emit("user-joined", socket.id, clients);

            if (messages.has(path)) {
                const roomMessages = messages.get(path);
                for (const msg of roomMessages) {
                    socket.emit("chat-message", msg.data, msg.sender, msg.socketIdSender);
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const roomId = socket.roomId;

            if (roomId) {
                if (!messages.has(roomId)) {
                    messages.set(roomId, []);
                }

                messages.get(roomId).push({ 
                    sender: sender, 
                    data: data, 
                    socketIdSender: socket.id 
                });

                io.in(roomId).emit("chat-message", data, sender, socket.id);
            }
        });

        socket.on("disconnect", () => {
            const roomId = socket.roomId;

            if (roomId) {
                socket.to(roomId).emit("user-left", socket.id);

                const room = io.sockets.adapter.rooms.get(roomId);
                if (!room || room.size === 0) {
                    messages.delete(roomId);
                }
            }
        });
    });

    return io;
};