import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";


const router = express.Router();




// ✅ Proper folder setup for chat files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/chat_files/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/getMessages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [
      { senderEmail: user1, receiverEmail: user2 },
      { senderEmail: user2, receiverEmail: user1 },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});


router.post("/send", upload.single("file"), async (req, res) => {
  try {
    const { senderEmail, receiverEmail, text } = req.body;

    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ message: "Missing sender or receiver email" });
    }

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    let fileUrl = null;
    let fileType = "text";
    let fileName = null;

    if (req.file) {
      fileUrl = `/uploads/chat_files/${req.file.filename}`;
      const ext = path.extname(req.file.originalname).toLowerCase();

      if ([".mp3", ".wav", ".webm", ".m4a"].includes(ext)) fileType = "audio";
      else if (ext === ".pdf") fileType = "pdf";
      else if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) fileType = "image";
      fileName = req.file.originalname;
    }

    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      text: text || "",
      fileUrl,
      fileType,
      fileName,
    });
    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    console.log("✅ Message saved:", populatedMessage);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// ✅ Fetch conversation between two users
router.get("/conversation", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.query;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver)
      return res.status(404).json({ message: "User not found" });

    // const messages = await Message.find({
    //   $or: [
    //     { senderId: sender._id, receiverId: receiver._id },
    //     { senderId: receiver._id, receiverId: sender._id },
    //   ],
    // }).sort({ createdAt: 1 });

    const messages = await Message.find({
      $or: [
        { senderId: sender._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id },
      ],
    })
      .populate("senderId", "email name")   // 👈 populate sender info
      .populate("receiverId", "email name") // 👈 populate receiver info
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Mark messages as seen
router.put("/mark-seen", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.body;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver)
      return res.status(404).json({ message: "User not found" });

    await Message.updateMany(
      { senderId: receiver._id, receiverId: sender._id, isSeen: false },
      { $set: { isSeen: true } }
    );

    res.json({ message: "Messages marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



router.get("/unread-count", async (req, res) => {
  const { senderEmail, receiverEmail } = req.query;

  try {
    // Resolve user IDs first to count by ObjectId (safer than matching populated fields)
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });
    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

    const count = await Message.countDocuments({
      senderId: sender._id,
      receiverId: receiver._id,
      isSeen: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching unread count" });
  }
});


// ✅ Get last message time between two users
router.get("/last-message-time", async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ message: "Missing users" });
    }

    const lastMessage = await Message.findOne({
      $or: [
        { senderEmail: user1, receiverEmail: user2 },
        { senderEmail: user2, receiverEmail: user1 },
      ],
    })
      .sort({ createdAt: -1 }) // newest first
      .select("createdAt");

    res.json({
      lastMessageTime: lastMessage ? lastMessage.createdAt : null,
    });
  } catch (error) {
    console.error("Error getting last message time:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/share", async (req, res) => {
  try {
    const { senderEmail, recipientEmails, text, fileUrl, fileType } = req.body;

    if (!senderEmail || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({ message: "Missing senderEmail or recipientEmails" });
    }

    const sender = await User.findOne({ email: senderEmail });
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    // Find recipients that exist in DB
    const recipients = await User.find({ email: { $in: recipientEmails } });
    if (!recipients || recipients.length === 0) {
      return res.status(404).json({ message: "No valid recipients found" });
    }

    // Build documents to insert
    const docs = recipients.map((r) => ({
      senderId: sender._id,
      receiverId: r._id,
      text: text || undefined,
      fileUrl: fileUrl || undefined,
      fileType: fileType || undefined,
      createdAt: new Date(),
    }));

    const created = await Message.insertMany(docs);

    // Populate before returning so frontend can use it immediately
    const populated = await Message.find({ _id: { $in: created.map((c) => c._id) } })
      .populate("senderId", "email name")
      .populate("receiverId", "email name");

    return res.status(201).json({ success: true, created: populated });
  } catch (err) {
    console.error("Error in /chat/share:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});



export default router;
















