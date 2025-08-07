// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext"; 


// const MediaMintAuditPortal = () => {
//   const navigate = useNavigate();
//  const { login } = useAuth(); // 👈 grab login method from context

//   const handleClick = () => {
//     // Simulate login
//     const role1 = {
//       name: "Test User1",
//       role: "qm", // 👈 must match allowedRoles in ProtectedRoute
//     };
//      const role2 = {
//       name: "Test User2",
//       role: "cm", // 👈 must match allowedRoles in ProtectedRoute
//     };

//     // Set token and user info
//     localStorage.setItem("authToken", "dummy_token"); // 👈 token for ProtectedRoute check
//     login(role1); // 👈 sets user context + localStorage

//     // Navigate to protected route
//     navigate("/tickets");
//   };



//   return (
//     <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 font-sans">
//       {/* Left Side (col-4) */}
//       <div className="hidden md:flex col-span-4 flex-col justify-center items-start px-10 bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
//         <h2 className="text-4xl font-light mb-2">Welcome to</h2>
//         <h1 className="text-5xl font-extrabold text-[#51cbce] mb-4 leading-tight">
//           Netflix<br />Ticket Tracker
//         </h1>
//         <p className="text-lg text-white/80 max-w-sm">
//           Efficiently track and manage your Netflix tickets in one place.
//         </p>
//       </div>

//       {/* Right Side (col-8) */}
//       <div className="col-span-12 md:col-span-8 flex items-center justify-center bg-[#0b0f1a]">
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-8 md:p-12 w-full max-w-md mx-6 text-center">
//           <h2 className="text-3xl font-semibold text-white mb-2">Login</h2>
//           <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

//           <button
//             onClick={handleClick}
//             className="flex items-center justify-center gap-3 w-full bg-white text-gray-800 font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:scale-105"
//           >
//             {/* <FcGoogle className="text-2xl" /> */}
//             Sign in with Google
//           </button>

//           <p className="text-xs text-gray-500 mt-6">
//             Powered by <span className="text-[#51cbce] font-semibold">MediaMint</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MediaMintAuditPortal;
