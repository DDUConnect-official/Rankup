import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, deleteUser, reauthenticateWithCredential, reauthenticateWithPopup, EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import DarkVeil from "../components/DarkVeil";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import GoogleIcon from "../assets/google.png";

const DashboardLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [password, setPassword] = useState("");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    /* ✅ Fetch Profile Data */
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.email) return;
            try {
                const response = await fetch(`${backendUrl}/api/users/check-profile/${user.email}`);
                const data = await response.json();

                if (data.exists) {
                    setProfileData(data.user);
                } else {
                    navigate("/profile-setup", { replace: true });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
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

            if (isGoogleUser) {
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(currentUser, provider);
            } else {
                const credential = EmailAuthProvider.credential(currentUser.email, password);
                await reauthenticateWithCredential(currentUser, credential);
            }

            const response = await fetch(`${backendUrl}/api/users/delete-account/${user.uid}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete profile from database");

            await deleteUser(currentUser);

            toast.success("Account deleted successfully", { id: toastId });
            navigate("/login");
        } catch (error) {
            console.error("Deletion error:", error);
            if (error.code === "auth/wrong-password") {
                toast.error("Incorrect password. Please try again.", { id: toastId });
            } else {
                toast.error("Failed to delete account. Please try again.", { id: toastId });
            }
        } finally {
            setDeleting(false);
            if (!password || isGoogleUser) setShowVerifyModal(false);
        }
    };

    if (loadingProfile) {
        return <Loader text="Loading Dashboard..." fullScreen />;
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <DarkVeil
                    hueShift={10}
                    speed={0.5}
                    noiseIntensity={0}
                    scanlineIntensity={0}
                    warpAmount={0}
                />
            </div>

            <Navbar
                avatar={profileData?.avatar}
                onLogout={handleLogoutConfirm}
                onDelete={() => setShowVerifyModal(true)}
            />

            <div className="relative z-10 pt-24 min-h-screen p-2.5 md:p-6 md:pt-24">
                <Outlet context={{ profileData }} />
            </div>

            {/* Verification Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-left">
                        <h2 className="text-2xl font-bold mb-2">Delete Account?</h2>
                        <p className="text-white/60 mb-6 font-medium">This action is permanent. To continue, please verify your identity.</p>

                        {isGoogleUser ? (
                            <div className="space-y-4">
                                <button onClick={handleVerifyAndDelete} disabled={deleting} className="cursor-pointer w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    <img src={GoogleIcon} alt="Google" className="w-5 h-5" /> {deleting ? "Verifying..." : "Verify with Google"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/40 mb-2 font-bold uppercase tracking-widest text-[10px]">Your Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#430abd] outline-none transition-all text-lg font-medium" autoFocus />
                                </div>
                                <button onClick={handleVerifyAndDelete} disabled={deleting || !password} className="cursor-pointer w-full py-4 bg-red-600 active:scale-[0.98] text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20">
                                    {deleting ? "Deleting..." : "Confirm Deletion"}
                                </button>
                            </div>
                        )}

                        <button onClick={() => { setShowVerifyModal(false); setPassword(""); }} disabled={deleting} className="cursor-pointer w-full mt-4 py-2 text-white/40 hover:text-white transition-all font-medium text-center">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {deleting && <Loader text="Deleting Account..." fullScreen />}
        </div>
    );
};

export default DashboardLayout;
