import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const STORAGE = localStorage; // Or use sessionStorage if you want temporary login

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle redirect back from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idToken = params.get("id_token") || params.get("token") || params.get("access_token");

    // If redirected with Google id_token, do backend sign-in
    if (idToken) {
      // POST id_token to your backend to get JWT and user info
      fetch("http://localhost:5000/api/google/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken })
      })
        .then(res => res.json())
        .then(data => {
          if (data.token && data.user) {
            // Save token and user details to storage
            STORAGE.setItem("authToken", data.token);
            STORAGE.setItem("user", JSON.stringify(data.user));
            STORAGE.setItem("role", data.user.role);
             STORAGE.setItem("email", data.user.email);


            // Save to context if needed
            login({
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              userId: data.user.userId,
            });

            // Navigate to the protected page
            navigate("/tickets");
          } else {
            alert("Login failed. Please try again.");
            navigate("/login");
          }
        })
        .catch(() => {
          alert("Login failed. Please try again.");
          navigate("/login");
        });
    }
  }, [login, navigate]);

  // Google OAuth click handler
  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/google/login");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      alert("Failed to start Google Login");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 font-sans">
      {/* Left Side */}
      <div className="hidden md:flex col-span-4 flex-col justify-center items-start px-10 bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <h2 className="text-4xl font-light mb-2">Welcome to</h2>
        <h1 className="text-5xl font-extrabold text-[#51cbce] mb-4 leading-tight">
          Netflix<br />Ticket Tracker
        </h1>
        <p className="text-lg text-white/80 max-w-sm">
          Efficiently track and manage your Netflix tickets in one place.
        </p>
      </div>

      {/* Right Side */}
      <div className="col-span-12 md:col-span-8 flex items-center justify-center bg-[#0b0f1a]">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-8 md:p-12 w-full max-w-md mx-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-2">Login</h2>
          <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

          <button
            onClick={handleClick}
            className="flex items-center justify-center gap-3 w-full bg-white text-gray-800 font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:scale-105"
          >
            Sign in with Google
          </button>

          <p className="text-xs text-gray-500 mt-6">
            Powered by <span className="text-[#51cbce] font-semibold">MediaMint</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
