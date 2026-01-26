import { useState, useEffect } from "react";
import { avatarList } from "../constants/avatars";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow } from "swiper/modules";
import RankUpLogo from "../assets/RankUp_Logo.png";
import Loader from "../components/Loader";
import ProfileSetupIntro from "../components/ProfileSetupIntro";

const ProfileSetup = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(step);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [hideHint, setHideHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [gender, setGender] = useState("male"); // 'male' | 'female'

  const [formData, setFormData] = useState({
    username: "",
    avatar: "",
    branch: "",
    university: "",
    aboutMe: "",
  });



  // Derive the list based on selected gender
  const filteredAvatars = avatarList.filter((avatar) => avatar.gender === gender);

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  /* ✅ Guard: If profile already exists, redirect to dashboard */
  useEffect(() => {
    const checkExistingProfile = async () => {
      const email = auth.currentUser?.email || state?.email;
      if (!email) return;

      try {
        const response = await fetch(`${backendUrl}/api/users/check-profile/${email}`);
        const data = await response.json();
        if (data.exists) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking profile existence:", error);
      }
    };

    checkExistingProfile();
  }, [backendUrl, navigate, state?.email]);

  /* ✅ auto select first avatar when gender or list changes */
  useEffect(() => {
    setActiveIndex(0);
    if (filteredAvatars.length > 0) {
      setFormData((prev) => ({ ...prev, avatar: filteredAvatars[0].url }));
    }
  }, [gender]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedStep(step);
    }, 200);

    return () => clearTimeout(timeout);
  }, [step]);

  const handleSlideChange = (index) => {
    setActiveIndex(index);
    if (filteredAvatars[index]) {
      setFormData((prev) => ({ ...prev, avatar: filteredAvatars[index].url }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, branch, university, aboutMe, avatar } = formData;

    if (!username || !branch || !university || !aboutMe || !avatar) {
      return toast.error("All fields are required!");
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/users/setup-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: auth.currentUser?.uid || state?.uid,
          email: auth.currentUser?.email || state?.email,
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success("RankUp Profile Created!");
        navigate("/dashboard");
      } else {
        const data = await response.json();
        toast.error(data.message || "Setup failed");
      }
    } catch {
      toast.error("Network error. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Profile Setup Intro Screen */}
      {showIntro && <ProfileSetupIntro onContinue={() => setShowIntro(false)} />}

      {/* Main Profile Setup Form */}
      <div className="w-full min-h-screen flex items-center justify-center py-10 overflow-x-hidden relative">

        {/* Logout Popover (Top Right Corner of Page) */}
        <div className="absolute top-6 md:top-8 right-0 z-100 flex flex-col items-end">
          <button
            onClick={() => setShowLogoutModal(!showLogoutModal)}
            className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${showLogoutModal
              ? "bg-white text-black border-white"
              : "bg-red-500 text-white border-white/10"
              }`}
          >
            <span>Logout</span>
          </button>

          {showLogoutModal && (
            <div className="mt-3 w-64 border border-white/10 rounded-2xl py-4 px-4 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl shadow-2xl">
              <h3 className="text-white font-bold mb-1">Log Out?</h3>
              <p className="text-white/40 text-[11px] mb-4 leading-relaxed">
                Are you sure you want to end your session? Your progress in this setup will be lost.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleLogoutConfirm}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all cursor-pointer text-xs active:scale-[0.98]"
                >
                  Confirm Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-2 text-white transition-all text-xs font-semibold cursor-pointer bg-[#006369] rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-lg rounded-2xl backdrop-blur-xl border border-white/10 text-white shadow-2xl relative">

          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between px-5 pt-8 md:px-8 md:pt-8">
            <h2 className="text-3xl font-bold">Profile Setup</h2>

            {/* Progress Circle */}
            <div className="relative w-10 h-10">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="rgba(255, 255, 255, 0.17)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="#fff"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * animatedStep) / 3}
                  strokeLinecap="round"
                  className="transition-all duration-500 linear"
                />
              </svg>

              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {animatedStep}/3
              </span>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <form onSubmit={handleSubmit} className="pb-8">

            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <div className="mt-8 space-y-5 px-5 md:px-8 transition-all duration-300 linear animate-fadeIn">
                <div>
                  <h3 className="text-lg font-semibold">Choose a Unique Username</h3>
                  <p className="text-sm text-white/60">
                    This will be your public identity on RankUp.
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Unique Username"
                  maxLength={20}
                  className="w-full p-3 rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
                  value={formData.username}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes(" ")) {
                      toast.error("Spaces are not allowed in usernames!", {
                        id: "space-error", // Prevent toast spam
                        duration: 2000,
                      });
                    }
                    setFormData({ ...formData, username: val.replace(/\s+/g, "") });
                  }}
                />
                <p className="text-xs text-white/40 text-left -mt-3.5 md:-mt-3.5 ml-1">
                  {formData.username.length}/20
                </p>

                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    if (!formData.username.trim())
                      return toast.error("Username is required");

                    setLoading(true);
                    try {
                      const response = await fetch(`${backendUrl}/api/users/check-username/${formData.username}`);
                      const data = await response.json();

                      if (data.available) {
                        setStep(2);
                      } else {
                        toast.error("This username is already taken. Choose another one.");
                      }
                    } catch (err) {
                      toast.error("Error checking username availability.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="cursor-pointer w-full bg-[#006369] active:scale-[0.98] text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
                >
                  {loading && step === 1 ? "Checking..." : "Continue"}
                </button>
              </div>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <div className="mt-3 transition-all duration-300 linear animate-fadeIn">

                <div className="mb-6 px-5 md:px-8">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Pick Up Your Persona
                  </h3>
                  <p className="text-sm text-white/60">
                    Your Persona shows your vibe to others.
                  </p>

                  <div className="flex items-center justify-between mt-3 px-1">
                    <p className="text-xs text-white/40 flex items-center gap-1 animate-swipeHint">
                      Swipe to explore more<span>→</span>
                    </p>

                    <div className="flex items-center gap-3">
                      <span
                        className={`cursor-pointer transition-colors ${gender === "male" ? "text-[#00e5ff] drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]" : "text-white/20 hover:text-white/50"}`}
                        onClick={() => setGender("male")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="M21 3 13.5 10.5" /><circle cx="10" cy="14" r="5" /></svg>
                      </span>

                      <div className="relative w-12 h-6 bg-white/10 rounded-full p-0.5 cursor-pointer flex items-center" onClick={() => setGender(gender === "male" ? "female" : "male")}>
                        <div
                          className={`w-5 h-5 bg-[#006369] rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${gender === "male" ? "translate-x-0" : "translate-x-6"
                            }`}
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                        </div>
                      </div>

                      <span
                        className={`cursor-pointer transition-colors ${gender === "female" ? "text-[#ff4081] drop-shadow-[0_0_5px_rgba(255,64,129,0.5)]" : "text-white/20 hover:text-white/50"}`}
                        onClick={() => setGender("female")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v7" /><path d="M9 19h6" /><circle cx="12" cy="10" r="5" /></svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Swiper */}
                <div className="relative w-full overflow-visible">
                  {/* Updated Swiper Key to force re-render on gender change */}
                  <Swiper
                    key={gender}
                    initialSlide={0}
                    modules={[EffectCoverflow]}
                    effect="coverflow"
                    centeredSlides
                    slidesPerView={1}
                    grabCursor
                    onSlideChange={(swiper) => {
                      handleSlideChange(swiper.activeIndex);
                      if (!hasSwiped) {
                        setHasSwiped(true);
                        setTimeout(() => setHideHint(true), 400);
                      }
                    }}
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 0,
                      depth: 180,
                      modifier: 1.5,
                      slideShadows: false,
                    }}
                    className="w-full overflow-visible"
                  >
                    {filteredAvatars.map((avatar, index) => (
                      <SwiperSlide
                        key={avatar.id}
                        className="flex justify-center overflow-visible"
                      >
                        <div className="flex flex-col items-center text-center overflow-visible">
                          <AvatarImage
                            src={avatar.url}
                            alt={avatar.name}
                            isActive={activeIndex === index}
                          />

                          <h3 className="mt-4 text-lg font-semibold">
                            {avatar.name}
                          </h3>

                          <p className="text-sm text-gray-400">
                            {avatar.desc}
                          </p>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6 px-5 md:px-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="cursor-pointer w-1/2 py-3 rounded-lg border border-gray-600 transition active:scale-[0.98]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="cursor-pointer w-1/2 bg-[#006369] active:scale-[0.98] text-white py-3 rounded-lg font-bold transition"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 3 && (
              <div className="mt-8 space-y-3 px-5 md:px-8 transition-all duration-300 linear animate-fadeIn">
                <div className="text-left space-y-1 mb-4">
                  <h3 className="text-lg font-semibold">Tell Us About Your Journey</h3>
                  <p className="text-sm text-white/60">
                    Helps us create the right profile for you.
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={20}
                  placeholder="Branch (BCA / MCA / etc)"
                  className="w-full p-3 text-sm rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="University Name"
                  maxLength={30}
                  className="w-full p-3 text-sm rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                />

                <textarea
                  maxLength={150}
                  placeholder="Describe your coding background..."
                  className="w-full p-3 text-sm h-28 rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent resize-none"
                  value={formData.aboutMe}
                  onChange={(e) =>
                    setFormData({ ...formData, aboutMe: e.target.value })
                  }
                />
                <p className="text-xs text-white/40 text-right -mt-3.5 md:-mt-3.5 mr-1">
                  {formData.aboutMe.length}/150
                </p>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="cursor-pointer w-1/2 py-3 rounded-lg border border-gray-600 transition active:scale-[0.98]"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="cursor-pointer w-1/2 bg-[#006369] active:scale-[0.98] text-white py-3 rounded-lg font-bold transition"
                  >
                    Rank Up!
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
        {loading && <Loader text="Setting up Profile..." fullScreen />}
      </div>
    </>
  );
};

const AvatarImage = ({ src, alt, isActive }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative w-[260px] md:w-[340px] aspect-square transition-all duration-300 ${isActive ? "scale-100 opacity-100" : "scale-80 opacity-40"}`}>
      {/* Skeleton / Loading State */}
      {!loaded && (
        <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain select-none pointer-events-none transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default ProfileSetup;
