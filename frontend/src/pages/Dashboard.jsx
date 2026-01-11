import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleIcon from "../assets/google.png";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [password, setPassword] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  /* ✅ Guard: If profile doesn't exist, redirect to profile setup */
  React.useEffect(() => {
    const checkProfile = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`${backendUrl}/api/users/check-profile/${user.email}`);
        const data = await response.json();
        if (!data.exists) {
          navigate("/profile-setup", { replace: true });
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };
    checkProfile();
  }, [user?.email, backendUrl, navigate]);

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleVerifyAndDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading("Verifying and deleting account...");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      // 1. Re-authenticate
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
      } else {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
      }

      // 2. Delete from MongoDB
      const response = await fetch(`${backendUrl}/api/users/delete-account/${user.uid}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile from database");
      }

      // 3. Delete from Firebase Auth
      await deleteUser(currentUser);

      toast.success("Account deleted successfully", { id: toastId });
      navigate("/login");
    } catch (error) {
      console.error("Deletion error:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.", { id: toastId });
      } else if (error.code === "auth/user-mismatch") {
        toast.error("Account mismatch. Please re-verify with the correct account.", { id: toastId });
      } else {
        toast.error("Failed to delete account. Please try again.", { id: toastId });
      }
    } finally {
      setDeleting(false);
      if (password && !isGoogleUser) {
        // Keep open for retry
      } else {
        setShowVerifyModal(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden text-center">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#430abd]/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#9d50bb]/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#430abd] to-[#9d50bb] bg-clip-text text-transparent">
          Welcome to RankUp
        </h1>
        <p className="text-white/60 mb-8 border-b border-white/10 pb-4 text-lg">
          Hello, {user?.displayName || user?.email || "User"}! You've successfully completed the auth flow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="p-5 rounded-xl bg-white/5 border border-white/5">
            <h3 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">Email</h3>
            <p className="text-xl font-semibold truncate">{user?.email}</p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/5">
            <h3 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">Status</h3>
            <p className="text-xl font-semibold text-green-400">Authenticated</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-lg font-bold text-lg cursor-pointer"
          >
            Logout
          </button>

          <button
            onClick={() => setShowVerifyModal(true)}
            className="px-8 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-all rounded-lg font-bold text-lg cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-left">
            <h2 className="text-2xl font-bold mb-2">Log Out?</h2>
            <p className="text-white/60 mb-8 font-medium">
              Are you sure you want to end your session?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleLogoutConfirm}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Confirm Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 text-white/40 hover:text-white transition-all font-medium cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-left">
            <h2 className="text-2xl font-bold mb-2">Delete Account?</h2>
            <p className="text-white/60 mb-6 font-medium">
              This action is permanent. To continue, please verify your identity.
            </p>

            {isGoogleUser ? (
              <div className="space-y-4">
                <button
                  onClick={handleVerifyAndDelete}
                  disabled={deleting}
                  className="cursor-pointer w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <img src={GoogleIcon} alt="Google" className="w-5 h-5" />                  {deleting ? "Verifying..." : "Verify with Google"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/40 mb-2 font-bold uppercase tracking-widest text-[10px]">Your Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#430abd] outline-none transition-all text-lg font-medium"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleVerifyAndDelete}
                  disabled={deleting || !password}
                  className="cursor-pointer w-full py-4 bg-red-600 active:scale-[0.98] text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {deleting ? "Deleting..." : "Confirm Deletion"}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowVerifyModal(false);
                setPassword("");
              }}
              disabled={deleting}
              className="cursor-pointer w-full mt-4 py-2 text-white/40 hover:text-white transition-all font-medium text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-white/30 text-sm">
        RankUp © 2026 • Coding Practice Platforom
      </p>
    </div>
  );
};

export default Dashboard;