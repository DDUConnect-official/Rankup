import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow } from "swiper/modules";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { avatarList } from "../constants/avatars";
import { Edit2, Save, X, BookOpen, GraduationCap, User as UserIcon, ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut, deleteUser, reauthenticateWithCredential, reauthenticateWithPopup, EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import GoogleIcon from "../assets/google.png";

const ProfileDetails = () => {
    const { profileData } = useOutletContext();
    const navigate = useNavigate();
    const { user } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // View vs Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        username: "",
        avatar: "",
        branch: "",
        university: "",
        aboutMe: "",
    });

    // Auth Actions states
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Gender for Avatar Selection
    const [gender, setGender] = useState("male");

    // Initialize data from profileData
    useEffect(() => {
        if (profileData) {
            setFormData({
                username: profileData.username || "",
                avatar: profileData.avatar || "",
                branch: profileData.branch || "",
                university: profileData.university || "",
                aboutMe: profileData.aboutMe || "",
            });

            // Try to find gender based on current avatar to set initial toggle state
            const currentAvatarObj = avatarList.find(a => a.url === profileData.avatar);
            if (currentAvatarObj) {
                setGender(currentAvatarObj.gender);
            }
        }
    }, [profileData]);

    const hasChanges = profileData && (
        formData.username !== (profileData.username || "") ||
        formData.avatar !== (profileData.avatar || "") ||
        formData.branch !== (profileData.branch || "") ||
        formData.university !== (profileData.university || "") ||
        formData.aboutMe !== (profileData.aboutMe || "")
    );

    const filteredAvatars = avatarList.filter((avatar) => avatar.gender === gender);

    // Handle Avatar Change via Swiper
    const handleSlideChange = (index) => {
        const selectedAvatar = filteredAvatars[index];
        if (selectedAvatar) {
            setFormData((prev) => ({ ...prev, avatar: selectedAvatar.url }));
        }
    };

    const isGoogleUser = user?.providerData?.some(
        (provider) => provider.providerId === "google.com"
    );

    const handleLogout = async () => {
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
            if (!password || isGoogleUser) setShowDeleteModal(false);
        }
    };

    const handleAbort = () => {
        if (profileData) {
            setFormData({
                username: profileData.username || "",
                avatar: profileData.avatar || "",
                branch: profileData.branch || "",
                university: profileData.university || "",
                aboutMe: profileData.aboutMe || "",
            });
            const currentAvatarObj = avatarList.find(a => a.url === profileData.avatar);
            if (currentAvatarObj) {
                setGender(currentAvatarObj.gender);
            }
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!formData.username || !formData.branch || !formData.university || !formData.aboutMe) {
            return toast.error("All fields are required!");
        }

        setLoading(true);
        try {
            // First check username availability if it changed
            if (formData.username !== profileData.username) {
                const checkRes = await fetch(`${backendUrl}/api/users/check-username/${formData.username}`);
                const checkData = await checkRes.json();
                if (!checkData.available) {
                    setLoading(false);
                    return toast.error("Username already taken!");
                }
            }

            const response = await fetch(`${backendUrl}/api/users/setup-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    ...formData,
                }),
            });

            if (response.ok) {
                toast.success("Profile Updated Successfully!");
                setIsEditing(false);
                window.location.reload();
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-slideUpFade">
            {/* Main Glass Container - Aligned with Dashboard layout */}
            <div className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-2xl shadow-xl relative overflow-hidden">

                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="group flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-black/40 border border-white/10 rounded-md md:rounded-xl transition-all duration-300 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-['Space_Grotesk'] text-xs md:text-sm font-bold text-cyan-100 tracking-widest uppercase">
                            Dashboard
                        </span>
                    </button>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-black/40 border border-white/10 rounded-md md:rounded-xl transition-all duration-300 group cursor-pointer"
                        >
                            <Edit2 className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                            <span className="font-['Space_Grotesk'] text-xs md:text-sm font-bold text-cyan-100 tracking-wider">EDIT CONFIG</span>
                        </button>
                    ) : (
                        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 md:gap-4 ml-auto">
                            <button
                                onClick={handleAbort}
                                className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-black/40 border border-white/10 rounded-md md:rounded-xl transition-all duration-300 group cursor-pointer"
                            >
                                <X className="w-4 h-4 text-red-400" />
                                <span className="font-['Space_Grotesk'] font-bold text-xs md:text-sm text-red-100 tracking-wider">ABORT</span>
                            </button>
                            <button
                                onClick={() => setShowSaveConfirm(true)}
                                disabled={loading || !hasChanges}
                                className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-black/40 border border-white/10 rounded-md md:rounded-xl transition-all duration-300 group cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Save className={`w-4 h-4 ${hasChanges ? "text-green-400" : "text-white/20"}`} /> <span className={`font-['Space_Grotesk'] font-bold text-xs md:text-sm tracking-wider ${hasChanges ? "text-green-100" : "text-white/20"}`}>SAVE</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

                    {/* Identity Module (Left) - Avatar on Top Design */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
                        <div className="relative w-full rounded-2xl overflow-hidden backdrop-blur-3xl border border-white/10 shadow-2xl group flex flex-col transition-all duration-500">
                            {/* Sparkle Effect (Themed for Profile) */}
                            <div className="absolute bottom-0 left-0 w-full h-200 overflow-hidden pointer-events-none z-30">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-sparkle rounded-full absolute bottom-0 bg-cyan-400"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            width: `${Math.random() * 2 + 3}px`,
                                            height: `${Math.random() * 2 + 3}px`,
                                            animationDuration: `${Math.random() * 3 + 5}s`,
                                            animationDelay: `${Math.random() * 4}s`,
                                            opacity: Math.random() * 0.4 + 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                            {/* Avatar Section (Top) */}
                            <div className="w-full aspect-square relative overflow-hidden rounded-b-full bg-black/40 border-b border-white/40">

                                {isEditing ? (
                                    <div className="w-full h-full relative z-0">
                                        <Swiper
                                            effect="coverflow"
                                            centeredSlides={true}
                                            slidesPerView={1}
                                            initialSlide={filteredAvatars.findIndex(a => a.url === formData.avatar) !== -1 ? filteredAvatars.findIndex(a => a.url === formData.avatar) : 0}
                                            key={gender}
                                            onSlideChange={(swiper) => handleSlideChange(swiper.activeIndex)}
                                            className="w-full h-full"
                                        >
                                            {filteredAvatars.map((avatar) => (
                                                <SwiperSlide key={avatar.id} className="w-full h-full flex items-center justify-center cursor-grab">
                                                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>

                                        {/* Gender Toggle Overlay (Stabilized) */}
                                        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center pointer-events-none px-6">
                                            <div className="bg-black/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto flex items-center justify-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/20">
                                                <button
                                                    onClick={() => setGender("male")}
                                                    className={`text-[11px] font-bold tracking-[0.15em] transition-all duration-300 ${gender === "male" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "text-white/20 hover:text-white/40"}`}
                                                >MALE</button>

                                                <div
                                                    className="w-12 h-6 bg-white/5 rounded-full relative cursor-pointer border border-white/10 p-1"
                                                    onClick={() => setGender(gender === "male" ? "female" : "male")}
                                                >
                                                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-500 ease-out shadow-lg ${gender === "male" ? "left-1 bg-cyan-400" : "left-7 bg-fuchsia-400"}`} />
                                                </div>

                                                <button
                                                    onClick={() => setGender("female")}
                                                    className={`text-[11px] font-bold tracking-[0.15em] transition-all duration-300 ${gender === "female" ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]" : "text-white/20 hover:text-white/40"}`}
                                                >FEMALE</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={formData.avatar || "https://api.dicebear.com/9.x/micah/svg?seed=RankUp"}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Identity Info (Bottom) */}
                            <div className="p-6 flex flex-col gap-3">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                                        {formData.username || "Ranker"}
                                    </h2>
                                    <p className="text-white/50 text-base leading-relaxed font-medium line-clamp-3">
                                        {formData.aboutMe || "Initializing profile identity protocols and synchronization modules..."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Global Identity</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                            <span className="text-md font-bold text-cyan-50/80 tracking-wide uppercase">Active Lvl 01</span>
                                        </div>
                                    </div>

                                    {/* Global Rank Display */}
                                    <div className=" px-5 py-2.5 rounded-2xl transition-all duration-300 text-right">
                                        <span className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Global Rank</span>
                                        <span className="text-2xl font-bold text-white  transition-colors">#1</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Module (Right) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full gap-8">
                        <div className="backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 grow flex flex-col shadow-2xl relative overflow-hidden">

                            {/* Sparkle Effect (Themed for Profile) */}
                            <div className="absolute bottom-0 left-0 w-full h-200 overflow-hidden pointer-events-none z-30">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-sparkle rounded-full absolute bottom-0 bg-cyan-400"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            width: `${Math.random() * 2 + 3}px`,
                                            height: `${Math.random() * 2 + 3}px`,
                                            animationDuration: `${Math.random() * 3 + 5}s`,
                                            animationDelay: `${Math.random() * 4}s`,
                                            opacity: Math.random() * 0.4 + 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-7 flex items-center gap-4 relative z-10 transition-transform duration-300 group-hover/info:translate-x-1">
                                <span className="w-1.5 h-8 bg-linear-to-b from-cyan-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></span>
                                Profile Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                {/* Identity Data */}
                                <div className="space-y-4">
                                    <label className="text-cyan-400/80 text-[11px] font-bold tracking-[0.25em] font-['Space_Grotesk'] uppercase flex items-center gap-3">
                                        <UserIcon className="w-4 h-4 text-cyan-500" /> User Codename
                                    </label>
                                    {isEditing ? (
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, "") })}
                                                maxLength={20}
                                                className="w-full bg-white/3 border-b-2 border-white/10 p-2 text-white font-mono text-lg placeholder:text-white/10 focus:border-cyan-400 focus:bg-cyan-400/5 outline-none transition-all duration-300"
                                                placeholder="ENTER USERNAME"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-400 transition-all duration-500 group-hover/input:w-full" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-white/2 border-l-4 border-cyan-500/50 text-white font-mono text-lg shadow-sm">
                                            {formData.username}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Academic Database Section */}
                            <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                                <h3 className="text-white/40 text-[11px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-fuchsia-500" /> Academic Database
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-fuchsia-400/80 text-[11px] font-bold tracking-[0.25em] font-['Space_Grotesk'] uppercase">
                                            Specialization
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.branch}
                                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                                maxLength={30}
                                                className="w-full bg-white/3 border-b-2 border-white/10 p-2 text-white font-mono text-lg placeholder:text-white/10 focus:border-fuchsia-400 focus:bg-fuchsia-400/5 outline-none transition-all duration-300"
                                                placeholder="ENTER_DATA"
                                            />
                                        ) : (
                                            <div className="p-2 bg-white/2 border-l-4 border-fuchsia-500/50 text-white font-mono text-lg">
                                                {formData.branch}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-fuchsia-400/80 text-[11px] font-bold tracking-[0.25em] font-['Space_Grotesk'] uppercase">
                                            Institution
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.university}
                                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                                maxLength={50}
                                                className="w-full bg-white/3 border-b-2 border-white/10 p-2 text-white font-mono text-lg placeholder:text-white/10 focus:border-fuchsia-400 focus:bg-fuchsia-400/5 outline-none transition-all duration-300"
                                                placeholder="ENTER_DATA"
                                            />
                                        ) : (
                                            <div className="p-2 bg-white/2 border-l-4 border-fuchsia-500/50 text-white font-mono text-lg">
                                                {formData.university}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio Log Section */}
                            <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                                <h3 className="text-white/40 text-[11px] font-bold tracking-[0.25em] uppercase mb-6 flex items-center gap-3">
                                    <UserIcon className="w-4 h-4 text-green-500" />System Logs
                                </h3>
                                {isEditing ? (
                                    <div className="relative">
                                        <textarea
                                            value={formData.aboutMe}
                                            onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                                            maxLength={200}
                                            rows={4}
                                            className="w-full bg-black/40 border border-white/10 p-6 text-white font-mono text-base focus:border-green-500/50 focus:shadow-[inset_0_0_30px_rgba(34,197,94,0.1)] outline-none transition-all resize-none placeholder:text-green-900 shadow-inner"
                                            placeholder="// ENTER_LOG_DATA..."
                                        />
                                        <div className="absolute bottom-4 right-6 text-[10px] text-green-500/40 font-mono tracking-widest">
                                            {formData.aboutMe.length}/200 BYTES
                                        </div>
                                    </div>
                                ) : (
                                    <div className=" bg-white/2 p-2 relative overflow-hidden group/biobox">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transition-all duration-500" />
                                        <p className="text-white font-mono text-lg leading-relaxed ml-1">
                                            {formData.aboutMe}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Auth Actions Section */}
                            <div className="mt-auto pt-8 border-t border-white/5 flex flex-wrap gap-3 items-center ">
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="flex items-center gap-2 px-3 py-2.5 bg-black/70 border border-white/10 rounded-md hover:border-white/20 transition-all duration-300 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 text-white/60  " />
                                    <span className="font-['Space_Grotesk'] font-bold text-xs text-white/60 tracking-widest uppercase">Logout</span>
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-black/70 border border-white/10 transition-all duration-300 group cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4 text-white/60" />
                                    <span className="font-['Space_Grotesk'] text-white/60 font-bold text-xs tracking-widest uppercase">Delete Account</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-2 text-white">Confirm Logout</h2>
                        <p className="text-white/60 mb-8 font-medium">Are you sure you want to terminate your current session?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-white cursor-pointer">
                                CANCEL
                            </button>
                            <button onClick={handleLogout} className="flex-1 py-4 bg-white text-black rounded-xl hover:bg-white/90 transition-all font-bold cursor-pointer">
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Save Confirm Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-2 text-white">Save Changes?</h2>
                        <p className="text-white/60 mb-8 font-medium">Your profile configuration will be updated across all systems. Continue?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowSaveConfirm(false)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-white cursor-pointer">
                                ABORT
                            </button>
                            <button onClick={() => { setShowSaveConfirm(false); handleSave(); }} className="flex-1 py-4 bg-white text-black rounded-xl transition-all font-bold cursor-pointer">
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-left">
                        <h2 className="text-2xl font-bold mb-2 text-white">Delete Account?</h2>
                        <p className="text-white/60 mb-6 font-medium">This action is permanent and cannot be undone. Please verify your identity.</p>

                        {isGoogleUser ? (
                            <div className="space-y-4">
                                <button onClick={handleVerifyAndDelete} disabled={deleting} className="cursor-pointer w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    <img src={GoogleIcon} alt="Google" className="w-5 h-5" /> {deleting ? "Verifying..." : "Verify with Google"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-[0.2em]">Verification Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none transition-all text-lg font-medium text-white" autoFocus />
                                </div>
                                <button onClick={handleVerifyAndDelete} disabled={deleting || !password} className="cursor-pointer w-full py-4 bg-red-600 active:scale-[0.98] text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20">
                                    {deleting ? "Deleting..." : "Confirm Deletion"}
                                </button>
                            </div>
                        )}

                        <button onClick={() => { setShowDeleteModal(false); setPassword(""); }} disabled={deleting} className="cursor-pointer w-full mt-4 py-2 text-white/40 hover:text-white transition-all font-bold text-center">
                            CANCEL
                        </button>
                    </div>
                </div>
            )}

            {deleting && <Loader text="DELETING ACCOUNT..." fullScreen />}
            {loading && <Loader text="EDITING YOUR PROFILE..." fullScreen />}
        </div>
    );
};

export default ProfileDetails;
