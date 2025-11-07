# 💬 SmartConnect – AI Communication Hub

SmartConnect is an **AI-powered real-time communication hub** built using the **MERN stack** and **Socket.IO**.  
It provides an intelligent, modern, and seamless chatting experience with features like real-time messaging, file sharing, voice messages, emojis, and AI integration.

---

## 🚀 Features

- ⚡ **Real-time Chat** – Instant one-on-one and group messaging using **Socket.IO**
- 🧑‍🤝‍🧑 **User Authentication** – Secure registration and login system
- 🟢 **Online/Offline Status** – Real-time user presence and last seen tracking
- 📁 **File & Image Sharing** – Upload, share, download, and delete files seamlessly
- 🎙️ **Voice Messages** – Record and send audio messages using the **MediaRecorder API**
- 😀 **Emoji Support** – Integrated **Emoji Picker API** for expressive messaging
- 🤖 **AI Integration** – SmartConnect’s AI module enhances user communication and suggestions
- 🔔 **Notifications** – Get notified for new messages and activities
- 💾 **Data Persistence** – All messages and media stored securely in **MongoDB**
- 📱 **Responsive Design** – Works beautifully on desktop, tablet, and mobile
- 🧹 **Clean UI/UX** – Inspired by modern chat apps like WhatsApp and Slack

---

## 🧠 Tech Stack

### **Frontend**
- React.js  
- CSS3 / TailwindCSS / Framer Motion  
- Emoji Picker API  
- MediaRecorder API  

### **Backend**
- Node.js  
- Express.js  
- Socket.IO  

### **Database**
- MongoDB (Mongoose)

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:
 
 1️⃣ Clone the repository
```bash
git clone https://github.com/YourUsername/smartconnect.git
cd smartconnect

2️⃣ Backend setup
cd backend
npm install
Create a .env file in the backend folder and add:
  MONGO_URI=your_mongodb_connection_string
  PORT=5000
  JWT_SECRET=your_secret_key

3️⃣ Frontend setup
  cd ../frontend
  npm install
  npm start
