import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatMessaging.css";
import defaultImg from "../assets/default.jpeg"; // default image
import EmojiPicker from "emoji-picker-react";
import socket from "../socket.js";
import axios from "axios";


const ChatMessaging = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000"; // adjust for deployment
  const messagesEndRef = useRef(null);
  const selectedMessageRef = useRef(null);
  const [friends, setFriends] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [file, setFile] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedShareFriends, setSelectedShareFriends] = useState([]);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const currentUser = sessionStorage.getItem("email");
 





// const handleLogout = () => {
//   sessionStorage.removeItem("email");
//   setMessages({});
//   navigate("/login");
// };

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
  if (selectedFriend && messages[selectedFriend]) {
    scrollToBottom();
  }
}, [messages, selectedFriend]);

const handleVoiceRecord = async () => {
  if (!recording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice_message.webm", {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("senderEmail", sessionStorage.getItem("email"));
        formData.append("receiverEmail", selectedFriend);
        formData.append("text", ""); // no text for audio

        try {
          const res = await fetch("http://localhost:5000/api/chat/send", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to send");

          console.log("Audio sent successfully:", data);
          // ✅ Optional: Add to messages state directly
          setMessages((prev) => ({
            ...prev,
            [selectedFriend]: [...(prev[selectedFriend] || []), data.data],
          }));
        } catch (err) {
          console.error("Error uploading audio:", err);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or unavailable.");
    }
  } else {
    mediaRecorder.stop();
    setRecording(false);
  }
};


// useEffect(() => {
//   const email = sessionStorage.getItem("email");

//   if (email) {
//     socket.emit("registerSocket", email);
//     socket.emit("userOnline", email);
//   }

//   // ✅ Receive new messages
//   socket.on("receiveMessage", (messageData) => {
//     setMessages((prev) => {
//       const friendEmail =
//         messageData.senderEmail === email
//           ? messageData.receiverEmail
//           : messageData.senderEmail;

//       return {
//         ...prev,
//         [friendEmail]: [...(prev[friendEmail] || []), messageData],
//       };
//     });
//   });

//   // ✅ Listen for online/offline updates
//   socket.on("updateUserStatus", (data) => {
//     console.log("Status update received:", data);

//     // Update the friend’s status live
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.email === data.email
//           ? { ...f, isOnline: data.isOnline, lastSeen: data.lastSeen }
//           : f
//       )
//     );
//   });

//   return () => {
//     socket.off("receiveMessage");
//     socket.off("updateUserStatus");
//     socket.disconnect();
//   };
// }, []);



// useEffect(() => {
//   const email = sessionStorage.getItem("email");

//   if (!email) return;

//   // Runs when socket connects (even after reconnection)
//   socket.on("connect", () => {
//     console.log("🔗 Socket connected:", socket.id);
//     socket.emit("registerSocket", email);
//     socket.emit("userOnline", email);
//   });

//   socket.on("receiveMessage", (messageData) => {
//     setMessages((prev) => {
//       const friendEmail =
//         messageData.senderEmail === email
//           ? messageData.receiverEmail
//           : messageData.senderEmail;

//       return {
//         ...prev,
//         [friendEmail]: [...(prev[friendEmail] || []), messageData],
//       };
//     });
//   });

//   socket.on("updateUserStatus", (data) => {
//     console.log("Status update received:", data);
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.email === data.email
//           ? { ...f, isOnline: data.isOnline, lastSeen: data.lastSeen }
//           : f
//       )
//     );
//   });

//   // ✅ Cleanup
//   return () => {
//     socket.off("connect");
//     socket.off("receiveMessage");
//     socket.off("updateUserStatus");
//     socket.disconnect();
//   };
// }, []); // ✅ DO NOT remove this closing bracket and semicolon


// useEffect(() => {
//   const email = sessionStorage.getItem("email");
//   if (email) {
//     socket.emit("registerSocket", email);
//   }
// }, []);

// useEffect(() => {
//   const email = sessionStorage.getItem("email");
//   if (!email) return;

//   socket.on("connect", () => {
//     console.log("🔗 Socket connected:", socket.id);
//     socket.emit("registerSocket", email);
//   });

//   socket.on("receiveMessage", (messageData) => {
//     setMessages((prev) => {
//       const friendEmail =
//         messageData.senderEmail === email
//           ? messageData.receiverEmail
//           : messageData.senderEmail;

//       return {
//         ...prev,
//         [friendEmail]: [...(prev[friendEmail] || []), messageData],
//       };
//     });
//   });

//   socket.on("updateUserStatus", (data) => {
//     console.log("📢 Status update received:", data);
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.email === data.email
//           ? { ...f, isOnline: data.isOnline, lastSeen: data.lastSeen }
//           : f
//       )
//     );
//   });

//   return () => {
//     socket.off("connect");
//     socket.off("receiveMessage");
//     socket.off("updateUserStatus");
//     // socket.disconnect();
//   };
// }, []);











useEffect(() => {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  // 👇 Only register after socket successfully connects
  const handleConnect = () => {
    console.log("🔗 Socket connected:", socket.id);
    socket.emit("registerSocket", email);
  };

  socket.on("connect", handleConnect);

  // 🔹 Handle incoming messages
  socket.on("receiveMessage", (messageData) => {
    setMessages((prev) => {
      const friendEmail =
        messageData.senderEmail === email
          ? messageData.receiverEmail
          : messageData.senderEmail;

      return {
        ...prev,
        [friendEmail]: [...(prev[friendEmail] || []), messageData],
      };
    });
  });

  // 🔹 Handle user online/offline status
  // socket.on("updateUserStatus", (data) => {
  //   console.log("📢 Status update received:", data);
  //   setFriends((prev) =>
  //     prev.map((f) =>
  //       f.email === data.email
  //         ? { ...f, isOnline: data.isOnline, lastSeen: data.lastSeen }
  //         : f
  //     )
  //   );
  // });

  socket.on("updateUserStatus", (data) => {
  console.log("📢 Status update received:", data);

  setFriends((prev) => {
    const exists = prev.some((f) => f.email.toLowerCase() === data.email.toLowerCase());

    if (exists) {
      // ✅ Update existing friend
      return prev.map((f) =>
        f.email.toLowerCase() === data.email.toLowerCase()
          ? { ...f, isOnline: data.isOnline, lastSeen: data.lastSeen }
          : f
      );
    } else {
      // ✅ If the user wasn't in the list yet, add them
      return [
        ...prev,
        {
          email: data.email,
          name: data.email.split("@")[0],
          profilePic: defaultImg,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
        },
      ];
    }
  });
});

  return () => {
    socket.off("connect", handleConnect);
    socket.off("receiveMessage");
    socket.off("updateUserStatus");
  };
}, []);


  // const handleLogout = () => {
  //   const email = sessionStorage.getItem("email");
  //   if (email) {
  //     socket.emit("userOffline", email); // 👈 tell server user is going offline
  //   }

  //   sessionStorage.removeItem("email");
  //   socket.disconnect(); // 👈 close socket connection
  //   setMessages({});
  //   navigate("/login");
  // };

  const handleLogout = () => {
  const email = sessionStorage.getItem("email");
  if (email) {
    socket.emit("userOffline", email);
  }
  sessionStorage.removeItem("email");
  socket.disconnect();
  setMessages({});
  navigate("/login");
};



// const formatLastSeen = (dateStr) => {
//   if (!dateStr) return "Unknown";
//   const date = new Date(dateStr);
//   if (isNaN(date.getTime())) return "Unknown";
  
//   const now = new Date();
//   const sameDay = date.toDateString() === now.toDateString();
//   const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   return sameDay ? `Last seen today at ${time}` : `Last seen on ${date.toDateString()} at ${time}`;
// };


const formatLastSeen = (dateStr) => {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unknown";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return sameDay
    ? `Last seen today at ${time}`
    : `Last seen on ${date.toDateString()} at ${time}`;
};


useEffect(() => {
  if (selectedFriend) {
    const currentUserEmail = sessionStorage.getItem("email");

    fetch(
      `http://localhost:5000/api/chat/getMessages/${currentUserEmail}/${selectedFriend}`
    )
      .then((res) => res.json())
      .then((data) => setMessages((prev) => ({ ...prev, [selectedFriend]: data })))
      .catch((err) => console.error("Error fetching messages:", err));
  }
}, [selectedFriend]);



  useEffect(() => {
    const handleClickOutside = () => {
      // Hide context menu and clear the hover selection when clicking anywhere outside
      setContextMenu({ visible: false, x: 0, y: 0 });
      setSelectedMessage(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);


useEffect(() => {
  const handleClickOutside = (event) => {
    if (emojiRef.current && !emojiRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

// useEffect(() => {
//   if (!socket) return;

//   socket.on("updateUserStatus", ({ email, isOnline, lastSeen }) => {
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.email === email
//           ? { ...f, isOnline, lastSeen: lastSeen || f.lastSeen }
//           : f
//       )
//     );
//   });

//   return () => socket.off("updateUserStatus");
// }, [socket]);


  const handleCopy = () => {
    if (selectedMessage?.text) {
      navigator.clipboard.writeText(selectedMessage.text);
      alert("Message copied!");
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleDelete = async () => {
    // Delete message from DB (optional)
    setMessages((prev) => ({
      ...prev,
      [selectedFriend]: (prev[selectedFriend] || []).filter(
        (m) => m._id !== selectedMessage._id
      ),
    }));
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleReply = () => {
    setNewMessage(`Replying to: ${selectedMessage.text || selectedMessage.fileName}`);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleShare = () => {
    setShowSharePopup(true);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

const openShareForMessage = (msgParam) => {
  const messageToShare = msgParam || selectedMessage;

  if (!messageToShare) {
    alert("No message selected to share.");
    setContextMenu({ visible: false, x: 0, y: 0 });
    return;
  }

  // ✅ Instantly store message in ref and state
  selectedMessageRef.current = messageToShare;
  setSelectedMessage(messageToShare);

  // ✅ Open popup immediately
  setShowSharePopup(true);
  setContextMenu({ visible: false, x: 0, y: 0 });
};



const handleConfirmShare = async () => {
  const msgToShare = selectedMessageRef.current || selectedMessage;

  if (!msgToShare) {
    alert("No message selected to share.");
    return;
  }

  if (!selectedShareFriends || selectedShareFriends.length === 0) {
    alert("Select at least one friend to share with.");
    return;
  }

  const senderEmail = sessionStorage.getItem("email");

  const payload = {
    senderEmail,
    recipientEmails: selectedShareFriends,
    text: msgToShare.text || undefined,
    fileUrl: msgToShare.fileUrl || undefined,
    fileType: msgToShare.fileType || undefined,
  };

  try {
    const res = await fetch("http://localhost:5000/api/chat/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Share failed:", data);
      alert("Share failed: " + (data.message || "Server error"));
      return;
    }

    alert(`✅ Message shared successfully to ${selectedShareFriends.length} friend(s)!`);

    if (selectedFriend && selectedShareFriends.includes(selectedFriend)) {
      setMessages((prev) => ({
        ...prev,
        [selectedFriend]: [...(prev[selectedFriend] || []), ...data.created],
      }));
    }

    // Reset after successful share
    setShowSharePopup(false);
    setSelectedShareFriends([]);
    selectedMessageRef.current = null;
    setSelectedMessage(null);
  } catch (error) {
    console.error("Error sharing message:", error);
    alert("Something went wrong while sharing.");
  }
};

  useEffect(() => {
  const fetchFriends = async () => {
    const email = sessionStorage.getItem("email");
    if (!email) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user/current?email=${email}`
      );
      const data = await response.json();

      const friendList = (data.friends || []).map((f) => ({
        name: f.name,
        email: f.email,
        profilePic: f.profilePic && f.profilePic.trim() ? f.profilePic : null,
      }));

      setFriends(friendList);

      // 🧮 Fetch unread counts for each friend (in parallel for speed)
      const unreadMap = {};
      const unreadPromises = friendList.map(async (f) => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/chat/unread-count?senderEmail=${f.email}&receiverEmail=${email}`
          );
          const countData = await res.json();
          unreadMap[f.email] = countData.unreadCount || 0;
        } catch (err) {
          console.error(`Error fetching unread count for ${f.email}:`, err);
          unreadMap[f.email] = 0;
        }
      });

      await Promise.all(unreadPromises); // wait for all to finish
      setUnreadCounts(unreadMap);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  fetchFriends();
}, []);

  useEffect(() => {
  const fetchFriends = async () => {
    const email = sessionStorage.getItem("email");
    if (!email) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user/current?email=${email}`
      );
      const data = await response.json();

      const friendList = (data.friends || []).map((f) => ({
        name: f.name,
        email: f.email,
        profilePic: f.profilePic && f.profilePic.trim() ? f.profilePic : null,
      }));

      // 🧮 Fetch unread counts and last message time for each friend in parallel
      const unreadMap = {};
      const lastMessageMap = {};

      const allPromises = friendList.map(async (f) => {
        try {
          // 1️⃣ Get unread count
          const unreadRes = await fetch(
            `http://localhost:5000/api/chat/unread-count?senderEmail=${f.email}&receiverEmail=${email}`
          );
          const unreadData = await unreadRes.json();
          unreadMap[f.email] = unreadData.unreadCount || 0;

          // 2️⃣ Get last message timestamp
          const lastMsgRes = await fetch(
            `http://localhost:5000/api/chat/last-message-time?user1=${email}&user2=${f.email}`
          );
          const lastMsgData = await lastMsgRes.json();
          lastMessageMap[f.email] = lastMsgData.lastMessageTime || null;
        } catch (err) {
          console.error(`Error fetching data for ${f.email}:`, err);
          unreadMap[f.email] = 0;
          lastMessageMap[f.email] = null;
        }
      });

      await Promise.all(allPromises);

      // 3️⃣ Sort friends: unread first, then latest message time
      const sortedFriends = [...friendList].sort((a, b) => {
        const unreadA = unreadMap[a.email] || 0;
        const unreadB = unreadMap[b.email] || 0;
        const timeA = lastMessageMap[a.email]
          ? new Date(lastMessageMap[a.email])
          : 0;
        const timeB = lastMessageMap[b.email]
          ? new Date(lastMessageMap[b.email])
          : 0;

        if (unreadA > unreadB) return -1;
        if (unreadA < unreadB) return 1;
        return timeB - timeA; // newer chats first
      });

      setFriends(sortedFriends);
      setUnreadCounts(unreadMap);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  fetchFriends();
}, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend) return;
      const senderEmail = sessionStorage.getItem("email");

      try {
        // 1️⃣ Fetch the conversation
        const response = await fetch(
          `http://localhost:5000/api/chat/conversation?senderEmail=${senderEmail}&receiverEmail=${selectedFriend}`
        );
        const data = await response.json();

        // 2️⃣ Update state with fetched messages
        setMessages((prev) => ({ ...prev, [selectedFriend]: data }));

        // 3️⃣ Mark messages as seen in the backend
        await markMessagesAsSeen();

        // Reset unread count for this friend
        setUnreadCounts((prev) => ({ ...prev, [selectedFriend]: 0 }));

        // 4️⃣ Instantly reflect "seen" in UI (optional, for smoother UX)
        setMessages((prev) => ({
          ...prev,
          [selectedFriend]: (prev[selectedFriend] || []).map((msg) =>
            msg.receiverId?.email === senderEmail
              ? { ...msg, isSeen: true }
              : msg
          ),
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedFriend]);

  const markMessagesAsSeen = async () => {
    if (!selectedFriend) return;

    const senderEmail = sessionStorage.getItem("email");

    try {
      await fetch("http://localhost:5000/api/chat/mark-seen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: senderEmail,       // the one who’s viewing
          receiverEmail: selectedFriend,  // the one whose chat is opened
        }),
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };


  const sendMessage = async () => {
  if (!newMessage.trim() && !file) return;
  const senderEmail = sessionStorage.getItem("email");

  try {
    let messageData = null;

    // 📤 If file is selected
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderEmail", senderEmail);
      formData.append("receiverEmail", selectedFriend);

      const res = await fetch("http://localhost:5000/api/chat/send", {  // ✅ fixed here
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        messageData = data.data;  // ✅ use 'data.data' not 'data.message'
      }
      setFile(null);
    } else {
      // ✉️ Text message
      const response = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail,
          receiverEmail: selectedFriend,
          text: newMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) messageData = data.data;
      setNewMessage("");
    }

    if (messageData) {
  // ✅ Show immediately for sender
  setMessages((prev) => ({
    ...prev,
    [selectedFriend]: [...(prev[selectedFriend] || []), messageData],
  }));

  // ✅ Emit to Socket.IO for real-time delivery
  socket.emit("sendMessage", messageData);
}

  } catch (error) {
    console.error("Error sending message:", error);
  }
};

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

return (
  <div className="chat-app">
    {/* Sidebar */}
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ←
        </button>
      </div>

      <ul className="friends-list">
        {friends.length > 0 ? (
          friends.map((friendObj, index) => (
            <li
              key={index}
              className={`friend-item ${
                selectedFriend === friendObj.email ? "active" : ""
              }`}
              onClick={() => setSelectedFriend(friendObj.email)}
            >
              <img
                src={friendObj.profilePic || defaultImg}
                alt={friendObj.name}
                className="friend-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = defaultImg;
                }}
              />
              <span>{friendObj.name}</span>
              {unreadCounts[friendObj.email] > 0 && (
                <span className="unread-badge">
                  {unreadCounts[friendObj.email]}
                </span>
              )}
            </li>
          ))
        ) : (
          <p className="no-friends">No friends added yet</p>
        )}
      </ul>
    </div>

    {/* Chat Area */}
    <div className="chat-area">
      {!selectedFriend ? (
        <div className="chat-welcome">
          <h2>Welcome to SmartConnect Chat</h2>
          <p>Select a friend to start conversation 💬</p>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <img
              src={
                friends.find((f) => f.email === selectedFriend)?.profilePic || defaultImg
              }
              alt={friends.find((f) => f.email === selectedFriend)?.name}
              className="chat-header-avatar"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultImg;
              }}
            />

            <div className="chat-header-info">
              <h3>{friends.find((f) => f.email === selectedFriend)?.name}</h3>
              <p className="chat-status">
                {(() => {
                  const friend = friends.find((f) => f.email === selectedFriend);
                  if (!friend) return "Unknown";

                  if (friend.isOnline) return "Online";

                  if (!friend.lastSeen) return "Last seen: Unknown";

                  const date = new Date(friend.lastSeen);
                  if (isNaN(date.getTime())) return "Last seen: Unknown";

                  return `Last seen: ${date.toLocaleString()}`;
                })()}
              </p>
            </div>
          </div>


        <div className="chat-box">
          {(messages[selectedFriend] || []).map((msg, index) => {
            const me = (sessionStorage.getItem("email") || "").toLowerCase().trim();
            const senderEmail = (
              (msg.senderEmail ||
                (msg.senderId && msg.senderId.email) ||
                msg.senderId) + ""
            )
              .toLowerCase()
              .trim();

            const isSent =
              (senderEmail && me && senderEmail === me) || msg.from === "You";

            let senderLabel;
            if (isSent) senderLabel = "You";
            else if (msg.senderId?.name) senderLabel = msg.senderId.name;
            else if (msg.senderId?.email) senderLabel = msg.senderId.email;
            else if (senderEmail) {
              const friend = friends.find((f) => f.email === senderEmail);
              senderLabel = friend ? friend.name : senderEmail;
            } else {
              senderLabel =
                friends.find((f) => f.email === selectedFriend)?.name || "Unknown";
            }

            return (
              <div
                key={index}
                className={`chat-message ${isSent ? "sent" : "received"}`}
                onMouseEnter={() => setSelectedMessage(msg)}
              >
                <div className="message-content">
                  {msg.text && (
                    <p>
                      <strong>{!isSent ? `${senderLabel}: ` : ""}</strong>
                      {msg.text}
                    </p>
                  )}

                {msg.fileType === "image" && (
                <img
                  src={
                    msg.fileUrl.startsWith("http")
                      ? msg.fileUrl
                      : `${BASE_URL}${msg.fileUrl}`
                  }
                  alt="sent"
                  className="chat-image"
                />
              )}

              {msg.fileType === "pdf" && (
                <div
                  className="chat-pdf-file"
                  onClick={() =>
                    window.open(
                      msg.fileUrl.startsWith("http")
                        ? msg.fileUrl
                        : `${BASE_URL}${msg.fileUrl}`,
                      "_blank"
                    )
                  }
                >
                  📄 {msg.fileName || msg.fileUrl.split("/").pop()}
                </div>
              )}

              {msg.fileType === "audio" && (
                <audio
                  controls
                  className="chat-audio"
                  autoPlay={isSent && index === (messages[selectedFriend]?.length || 0) - 1}
                >
                  <source
                    src={
                      msg.fileUrl.startsWith("http")
                        ? msg.fileUrl
                        : `${BASE_URL}${msg.fileUrl}`
                    }
                    type="audio/webm"
                  />
                  Your browser does not support audio playback.
                </audio>
              )}


                </div>

                <button
                  className="message-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMessage(msg);
                    setContextMenu({
                      visible: !contextMenu.visible,
                      x: e.pageX,
                      y: e.pageY,
                    });
                  }}
                  aria-label="message menu"
                >
                  <i className="fa-solid fa-angle-down" aria-hidden="true"></i>
                </button>

                <div className="message-footer">
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {isSent && (
                    <div className="message-status">
                      {msg.isSeen ? (
                        <span className="ticks seen">✔✔</span>
                      ) : (
                        <span className="ticks delivered">✔</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>



          {/* ✅ Context Menu */}
          {contextMenu.visible && (
            <div
              className="message-menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: contextMenu.y,
                left: contextMenu.x,
                background: "#222",
                color: "white",
                borderRadius: "8px",
                padding: "6px 10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 1000,
              }}
            >
              {selectedMessage?.fileType ? (
                <>
                  <div className="menu-item" onClick={() => openShareForMessage(selectedMessage)}>📤 Share</div>
                  <div className="menu-item" onClick={() => window.open(selectedMessage.fileUrl, "_blank")}>⬇ Download</div>
                  <div className="menu-item" onClick={handleReply}>↩ Reply</div>
                  <div className="menu-item" onClick={handleDelete}>🗑 Delete</div>
                </>
              ) : (
                <>
                  <div className="menu-item" onClick={handleCopy}>📋 Copy</div>
                  <div className="menu-item" onClick={handleReply}>↩ Reply</div>
                  {/* <div className="menu-item" onClick={handleShare}>📤 Share</div> */}
                  <div className="menu-item" onClick={() => openShareForMessage(selectedMessage)}>
                    📤 Share
                  </div>

                  <div className="menu-item" onClick={handleDelete}>🗑 Delete</div>
                </>
              )}
            </div>
          )}

          {/* ✅ Share Popup */}
          {showSharePopup && (
            <div className="share-popup">
              <div className="share-popup-content">
                <h3>Share message with:</h3>
                <div className="friends-share-list">
                  {friends.map((f, i) => (
                    <label key={i} className="share-friend-item">
                      <input
                        type="checkbox"
                        checked={selectedShareFriends.includes(f.email)}
                        onChange={() => {
                          setSelectedShareFriends((prev) =>
                            prev.includes(f.email)
                              ? prev.filter((e) => e !== f.email)
                              : [...prev, f.email]
                          );
                        }}
                      />
                      <img
                        src={f.profilePic || defaultImg}
                        alt={f.name}
                        className="share-friend-avatar"
                      />
                      <span>{f.name}</span>
                    </label>
                  ))}
                </div>

                <div className="share-popup-actions">
                  <button onClick={handleConfirmShare}>Share</button>
                  <button onClick={() => setShowSharePopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="chat-input">
          <label className="upload-btn">
            +
            <input
              type="file"
              style={{ display: "none" }}
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
            />
          </label>

              {showEmojiPicker && (
                <div className="emoji-picker-popup" ref={emojiRef}>
                  <EmojiPicker
                    onEmojiClick={(emojiData) =>
                      setNewMessage((prev) => prev + emojiData.emoji)
                    }
                    emojiStyle="native"
                    theme="light"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                </div>
              )}

            {/* ✅ Emoji Button */}
            <button
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>


          <input
            type="text"
            placeholder={file ? `Selected: ${file.name}` : "Type a message..."}
            value={file ? "" : newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!!file}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(); // ✅ Pressing Enter will also send the message
              }
            }}
          />

          <button
            className={`mic-btn ${recording ? "recording" : ""}`}
            onClick={handleVoiceRecord}
            title={recording ? "Stop Recording" : "Record Voice"}
          >
            <i className="fa-solid fa-microphone"></i>
          </button>

          <button onClick={sendMessage}>Send</button> {/* ✅ Send button still works */}
        </div>

        </>
      )}
    </div>
  </div>
);
};

export default ChatMessaging;