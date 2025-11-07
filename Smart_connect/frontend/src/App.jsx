import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import ChatMessaging from "./pages/ChatMessaging";

function App() {
  const location = useLocation();

  // Paths where Navbar and Footer should NOT appear
  const hideLayoutPaths = ["/dashboard", "/login", "/signup", "/profile-settings", "/chat"];

  const hideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/chat" element={<ChatMessaging />} />
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

// Wrap App in Router here
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
