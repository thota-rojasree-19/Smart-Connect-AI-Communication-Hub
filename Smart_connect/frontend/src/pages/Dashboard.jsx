
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import HomeNavbar from "../components/HomeNavbar";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [userFriends, setUserFriends] = useState([]); 
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [members, setMembers] = useState([]);
  const [notifications] = useState(["Let's Connect with new friends"]);

  const navigate = useNavigate();

  // ✅ Fetch current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const email = sessionStorage.getItem("email");
        if (!email) return;

        const response = await fetch(
          `http://localhost:5000/api/user/current?email=${email}`
        );

        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();

        setUserName(data.name);

        // ✅ Normalize friends (convert to list of emails)
        const friendEmails = Array.isArray(data.friends)
          ? data.friends.map((f) => (typeof f === "string" ? f : f.email))
          : [];

        setUserFriends(friendEmails);

        sessionStorage.setItem("name", data.name);
        sessionStorage.setItem("email", data.email);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // ✅ Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/members");
        if (!res.ok) throw new Error("Failed to fetch members");
        setMembers(await res.json());
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  // ✅ Checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // ✅ Add friends to DB
  const handleAddFriends = async () => {
    if (selectedFriends.length === 0) {
      alert("Please select at least one member.");
      return;
    }

    try {
      const userEmail = sessionStorage.getItem("email");

      // Get selected friends’ emails
      const friendEmails = members
        .filter((m) => selectedFriends.includes(m._id))
        .map((m) => m.email);

      const response = await fetch("http://localhost:5000/api/user/add-friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, friendEmails }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to add friends");

      alert(`Friends added: ${friendEmails.join(", ")}`);

      // ✅ Update local state
      setUserFriends((prev) => [...new Set([...prev, ...friendEmails])]);
      setSelectedFriends([]);
      setShowFriendsList(false);
    } catch (err) {
      console.error("Error adding friends:", err);
      alert("Error adding friends. Try again!");
    }
  };

  const features = [
    {
      title: "Chat / Messaging",
      description: "Send instant messages",
      onClick: () => navigate("/chat"),
    },
    {
      title: "Voice Messaging",
      description: "Send quick voice messages",
      onClick: () => alert("Navigating to Voice Messages..."),
    },
    {
      title: "AI Smart Replies",
      description: "AI suggests intelligent responses",
      onClick: () => alert("Navigating to Smart Replies..."),
    },
    {
      title: "Profile & Settings",
      description: "Manage your account",
      onClick: () => navigate("/profile-settings"),
    },
  ];

  return (
    <>
      <HomeNavbar />

      <div className="dashboard-container">
        <section className="welcome-section">
          <h1>Welcome, {userName ? userName : "Loading..."}!</h1>
          <p>Here’s a quick summary of your notifications and tasks:</p>

          <ul className="notifications-list">
            {notifications.map((note, i) => (
              <li
                key={i}
                className={note.includes("friends") ? "clickable" : ""}
                onClick={
                  note.includes("friends")
                    ? () => setShowFriendsList(!showFriendsList)
                    : undefined
                }
              >
                {note}
              </li>
            ))}
          </ul>

          {showFriendsList && (
            <div className="friends-list">
              <h3>Select Friends</h3>
              <ul>
                {members
                  .filter((m) => {
                    const currentEmail = sessionStorage.getItem("email");
                    // ✅ exclude self and already-added friends
                    return (
                      m.email !== currentEmail &&
                      !userFriends.includes(m.email)
                    );
                  })
                  .map((m) => (
                    <li key={m._id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(m._id)}
                          onChange={() => handleCheckboxChange(m._id)}
                        />
                        {m.name}
                      </label>
                    </li>
                  ))}
              </ul>
              <button className="add-friend-btn" onClick={handleAddFriends}>
                Add Friend
              </button>
            </div>
          )}
        </section>

        <section className="features-section">
          <h2>What you can do</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
