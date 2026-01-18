import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow } from "swiper/modules";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { avatarList } from "../constants/avatars";
import { Edit2, Save, X, BookOpen, GraduationCap, User as UserIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

    // Gender for Avatar Selection
    const [gender, setGender] = useState("male");
    const [activeIndex, setActiveIndex] = useState(0);

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
                // Also find index to scroll swiper to (optional refinement)
            }
        }
    }, [profileData]);

    const filteredAvatars = avatarList.filter((avatar) => avatar.gender === gender);

    // Handle Avatar Change via Swiper
    const handleSlideChange = (index) => {
        setActiveIndex(index);
        if (filteredAvatars[index]) {
            setFormData((prev) => ({ ...prev, avatar: filteredAvatars[index].url }));
        }
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
                // Ideally, trigger a refresh of profileData via context or reload
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
        <div className="w-full min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
            `}</style>
            
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
            </div>

            {/* Main HUD Container */}
            <div className="w-full max-w-7xl relative z-10 animate-slideUpFade flex flex-col h-[calc(100vh-4rem)]">
                    {/* Header Bar */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <button 
                        onClick={() => navigate("/dashboard")}
                        className="group flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-lg hover:border-cyan-400/50 hover:bg-cyan-900/20 transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-['Space_Grotesk'] text-sm font-bold text-cyan-100 tracking-widest uppercase">
                            Dashboard
                        </span>
                    </button>

                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 group"
                        >
                            <Edit2 className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                            <span className="font-['Space_Grotesk'] font-bold text-cyan-100 tracking-wider">INITIALIZE EDIT</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
                            >
                                <X className="w-4 h-4 text-red-400" />
                                <span className="font-['Space_Grotesk'] font-bold text-red-100 tracking-wider">ABORT</span>
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 hover:border-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300"
                            >
                                {loading ? <Loader text="" size="small" /> : <><Save className="w-4 h-4 text-green-400" /> <span className="font-['Space_Grotesk'] font-bold text-green-100 tracking-wider">SAVE CONFIG</span></>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Tech Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grow overflow-hidden">
                    
                    {/* Identity Module (Left) */}
                    <div className="md:col-span-4 lg:col-span-3 flex flex-col h-full">
                         <div className="relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/5 overflow-hidden group grow flex flex-col">
                            {/* Scanning line animation */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent w-full h-[50%] -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]" />
                            
                            <div className="bg-black/60 rounded-xl p-6 flex flex-col items-center border border-white/5 relative z-10 grow justify-center">
                                {/* Avatar Frame */}
                                <div className="relative w-48 h-48 mb-6">
                                    {/* Rotating outer ring */}
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]" />
                                    <div className="absolute inset-2 rounded-full border border-white/10" />
                                    
                                    {/* Active Avatar Container */}
                                    <div className="absolute inset-4 rounded-full overflow-hidden bg-black ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                        {isEditing ? (
                                            <Swiper
                                                effect="coverflow"
                                                centeredSlides={true}
                                                slidesPerView={1}
                                                onSlideChange={(swiper) => handleSlideChange(swiper.activeIndex)}
                                                className="w-full h-full"
                                            >
                                                {filteredAvatars.map((avatar) => (
                                                    <SwiperSlide key={avatar.id} className="flex justify-center items-center h-full bg-black">
                                                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        ) : (
                                            <img 
                                                src={formData.avatar || "https://api.dicebear.com/9.x/micah/svg?seed=RankUp"} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Level Badge */}
                                    {!isEditing && (
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg z-20">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                            <span className="text-[10px] font-bold text-cyan-400 tracking-widest font-['Space_Grotesk']">LVL.01</span>
                                        </div>
                                    )}
                                </div>

                                {/* Gender Toggle (Edit Mode) */}
                                {isEditing && (
                                    <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-2">
                                        <button 
                                            onClick={() => setGender("male")}
                                            className={`text-xs font-bold transition-colors ${gender === "male" ? "text-cyan-400" : "text-white/30"}`}
                                        >M</button>
                                        <div 
                                            className="w-8 h-4 bg-black rounded-full relative cursor-pointer border border-white/20"
                                            onClick={() => setGender(gender === "male" ? "female" : "male")}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${gender === "male" ? "left-0.5 bg-cyan-400" : "left-4 bg-fuchsia-400"}`} />
                                        </div>
                                        <button 
                                            onClick={() => setGender("female")}
                                            className={`text-xs font-bold transition-colors ${gender === "female" ? "text-fuchsia-400" : "text-white/30"}`}
                                        >F</button>
                                    </div>
                                )}

                                <div className="text-center w-full">
                                    <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-1 break-all">
                                        {formData.username || "UNKNOWN USER"}
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 text-white/40 text-xs tracking-wider">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        ONLINE
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Stats & Details Module (Right) */}
                    <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full">
                        {/* Main Info Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-y-auto grow flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                            {/* Decorative Corner Accents */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-2xl" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-fuchsia-500/30 rounded-br-2xl" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                {/* Username Input */}
                                <div className="space-y-2">
                                    <label className="text-cyan-400/70 text-[10px] font-bold tracking-[0.2em] font-['Space_Grotesk'] uppercase flex items-center gap-2">
                                        <UserIcon className="w-3 h-3" /> User Identity
                                    </label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value.replace(/\s+/g, "")})}
                                                maxLength={20}
                                                className="w-full bg-white/5 border-b-2 border-white/10 px-4 py-3 text-white font-mono placeholder:text-white/20 focus:border-cyan-400 focus:bg-cyan-400/5 outline-none transition-all duration-300"
                                                placeholder="ENTER_CODENAME"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-400 transition-all duration-500 group-hover:w-full" />
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-white/5 border-l-2 border-cyan-500/50 text-white font-mono">
                                            {formData.username}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Academic Data */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h3 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <BookOpen className="w-3 h-3 text-fuchsia-400" /> Academic Database
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-fuchsia-400/70 text-[10px] font-bold tracking-[0.2em] font-['Space_Grotesk'] uppercase">
                                            Specialization / Major
                                        </label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={formData.branch}
                                                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                                                maxLength={20}
                                                className="w-full bg-white/5 border-b-2 border-white/10 px-4 py-3 text-white font-mono placeholder:text-white/20 focus:border-fuchsia-400 focus:bg-fuchsia-400/5 outline-none transition-all duration-300"
                                                placeholder="ENTER_BRANCH"
                                            />
                                        ) : (
                                            <div className="p-3 bg-white/5 border-l-2 border-fuchsia-500/50 text-white font-mono">
                                                {formData.branch}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-fuchsia-400/70 text-[10px] font-bold tracking-[0.2em] font-['Space_Grotesk'] uppercase">
                                            Institution
                                        </label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={formData.university}
                                                onChange={(e) => setFormData({...formData, university: e.target.value})}
                                                maxLength={40}
                                                className="w-full bg-white/5 border-b-2 border-white/10 px-4 py-3 text-white font-mono placeholder:text-white/20 focus:border-fuchsia-400 focus:bg-fuchsia-400/5 outline-none transition-all duration-300"
                                                placeholder="ENTER_UNIVERSITY"
                                            />
                                        ) : (
                                            <div className="p-3 bg-white/5 border-l-2 border-fuchsia-500/50 text-white font-mono">
                                                {formData.university}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                                 <h3 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <UserIcon className="w-3 h-3 text-green-400" /> Bio / Logs
                                </h3>
                                {isEditing ? (
                                    <div className="relative">
                                        <textarea 
                                            value={formData.aboutMe}
                                            onChange={(e) => setFormData({...formData, aboutMe: e.target.value})}
                                            maxLength={150}
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-green-400 font-mono text-sm focus:border-green-500/50 focus:shadow-[inset_0_0_20px_rgba(34,197,94,0.1)] outline-none transition-all resize-none placeholder:text-green-900"
                                            placeholder="// ENTER_BIO_DATA..."
                                        />
                                        <div className="absolute bottom-2 right-4 text-[10px] text-green-500/50 font-mono">
                                            {formData.aboutMe.length}/150 CHARS
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-black/40 rounded-lg p-6 border border-white/5 relative overflow-hidden group">
                                         <div className="absolute top-0 left-0 w-2 h-full bg-green-500/20" />
                                        <p className="text-green-300/80 font-mono text-sm leading-relaxed">
                                            <span className="text-green-600 mr-2">{">"}</span>
                                            {formData.aboutMe}
                                            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1 align-middle" />
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Save Action Removed - Moved to Header */}
                        </div>
                    </div>
                </div>
            </div>
            
            {loading && !isEditing && <Loader text="UPDATING SYSTEM..." fullScreen />}
        </div>
    );
};

export default ProfileDetails;
