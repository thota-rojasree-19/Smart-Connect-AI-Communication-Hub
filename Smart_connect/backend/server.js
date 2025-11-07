// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// import authRoutes from "./routes/auth.js";
// import membersRoute from "./routes/members.js";
// import userRoute from "./routes/user.js";
// import uploadRoutes from "./routes/uploadRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";

// import { Server } from "socket.io";
// import User from "./models/User.js";

// const io = new Server(server, { cors: { origin: "*" } });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("userOnline", async (email) => {
//     await User.findOneAndUpdate({ email }, { isOnline: true });
//     io.emit("updateUserStatus", { email, isOnline: true });
//   });

//   socket.on("disconnect", async () => {
//     const user = await User.findOneAndUpdate(
//       { socketId: socket.id },
//       { isOnline: false, lastSeen: new Date(), socketId: null },
//       { new: true }
//     );
//     if (user) io.emit("updateUserStatus", { email: user.email, isOnline: false, lastSeen: user.lastSeen });
//   });

//   socket.on("registerSocket", async (email) => {
//     await User.findOneAndUpdate({ email }, { socketId: socket.id });
//   });
// });

// // ✅ ES module support
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ Load environment variables
// dotenv.config({ path: "./config.env" });

// // ✅ Initialize Express app FIRST
// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ Serve uploaded files
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// // app.use("/uploads", express.static("uploads"));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// // ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoute);
// app.use("/api/members", membersRoute);
// app.use("/api/user", uploadRoutes);
// app.use("/api/chat", chatRoutes);

// // ✅ MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.log("MongoDB connection error:", err));

// // ✅ Start server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import membersRoute from "./routes/members.js";
import userRoute from "./routes/user.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import User from "./models/User.js";

// ✅ ES module support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
dotenv.config({ path: "./config.env" });

// ✅ Initialize Express app FIRST
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server for Socket.IO
const server = createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",  // ✅ your frontend port
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// const userConnections = {};

// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);
//   socket.on("registerSocket", async (email) => {
//   if (!email) return;

//   // Track multiple tabs per user
//   if (!userConnections[email]) userConnections[email] = new Set();
//   userConnections[email].add(socket.id);

//   const user = await User.findOneAndUpdate(
//     { email },
//     { socketId: socket.id, isOnline: true },
//     { new: true }
//   );

//   console.log(`🟢 ${email} connected (${userConnections[email].size} tabs)`);

//   io.emit("updateUserStatus", {
//     email: user.email,
//     isOnline: true,
//     lastSeen: user.lastSeen, // ✅ send actual lastSeen, not null
//   });
// });


// socket.on("userOnline", async (email) => {
//   if (!email) return;
//   const user = await User.findOneAndUpdate(
//     { email },
//     { isOnline: true, socketId: socket.id },
//     { new: true }
//   );
//   if (user) {
//     io.emit("updateUserStatus", {
//       email: user.email,
//       isOnline: true,
//       lastSeen: user.lastSeen,
//     });
//   }
// });

//   socket.on("userOffline", async (email) => {
//   const user = await User.findOneAndUpdate(
//     { email },
//     { isOnline: false, lastSeen: new Date() },
//     { new: true }
//   );

//   if (user) {
//     console.log(`🔴 ${user.email} manually logged out`);
//     io.emit("updateUserStatus", {
//       email: user.email,
//       isOnline: false,
//       lastSeen: user.lastSeen,
//     });
//   }
// });


//   socket.on("disconnect", async () => {
//     // Find user for this socket
//     const user = await User.findOne({ socketId: socket.id });
//     if (!user) return;

//     const email = user.email;
//     if (userConnections[email]) {
//       userConnections[email].delete(socket.id);
//       if (userConnections[email].size === 0) {
//         // User closed all tabs → mark offline
//         await User.findOneAndUpdate(
//           { email },
//           { isOnline: false, lastSeen: new Date(), socketId: null },
//           { new: true }
//         );

//         console.log(`🔴 ${email} went offline`);
//         io.emit("updateUserStatus", {
//           email,
//           isOnline: false,
//           lastSeen: new Date(),
//         });
//       }
//     }
//   });
// });

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ✅ your frontend port
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userConnections = {}; // store all active sockets per user

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔹 Register user when frontend connects
  socket.on("registerSocket", async (email) => {
    if (!email) return;

    if (!userConnections[email]) userConnections[email] = new Set();
    userConnections[email].add(socket.id);

    const user = await User.findOneAndUpdate(
      { email },
      { socketId: socket.id, isOnline: true },
      { new: true }
    );

    console.log(`🟢 ${email} connected (${userConnections[email].size} tabs)`);

    io.emit("updateUserStatus", {
      email: user.email,
      isOnline: true,
      lastSeen: user.lastSeen, // usually null on first connect
    });
  });

  // 🔹 Manual logout (user clicked Logout)
  socket.on("userOffline", async (email) => {
    if (!email) return;

    const lastSeen = new Date();
    const user = await User.findOneAndUpdate(
      { email },
      { isOnline: false, lastSeen, socketId: null },
      { new: true }
    );

    if (user) {
      console.log(`🔴 ${user.email} manually logged out at ${lastSeen}`);
      io.emit("updateUserStatus", {
        email: user.email,
        isOnline: false,
        lastSeen,
      });
    }
  });

  // 🔹 On tab close or disconnect
  socket.on("disconnect", async () => {
    const user = await User.findOne({ socketId: socket.id });
    if (!user) return;

    const email = user.email;
    if (userConnections[email]) {
      userConnections[email].delete(socket.id);

      // ✅ Only set offline when all tabs are closed
      if (userConnections[email].size === 0) {
        const lastSeen = new Date();

        await User.findOneAndUpdate(
          { email },
          { isOnline: false, lastSeen, socketId: null },
          { new: true }
        );

        console.log(`🔴 ${email} went offline at ${lastSeen}`);
        io.emit("updateUserStatus", {
          email,
          isOnline: false,
          lastSeen,
        });
      }
    }
  });
});


// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/members", membersRoute);
app.use("/api/user", uploadRoutes);
app.use("/api/chat", chatRoutes);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ✅ Start server (use `server.listen`, not `app.listen`)
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
