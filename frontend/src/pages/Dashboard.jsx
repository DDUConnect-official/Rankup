import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { useOutletContext, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { Calculator, Atom, Code2, Bot } from "lucide-react";
import axios from "axios";
import LeaderboardWidget from "../components/dashboard/LeaderboardWidget";
import DsaChallengeWidget from "../components/dashboard/DsaChallengeWidget";
import LearningModuleCard from "../components/dashboard/LearningModuleCard";
import CareerAgentCard from "../components/dashboard/CareerAgentCard";
import WelcomeGuide from "../components/WelcomeGuide";
import StartDsaModal from "../components/dsa/StartDsaModal";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileData } = useOutletContext(); // Get profile data from Layout
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [dynamicModules, setDynamicModules] = useState([]);
  const [dsaProgress, setDsaProgress] = useState(null);
  const [showStartDsaModal, setShowStartDsaModal] = useState(false);
  const [startingDsa, setStartingDsa] = useState(false);

  const iconMap = {
    javascript: <Code2 className="w-8 h-8 text-yellow-400" />,
    python: <Bot className="w-8 h-8 text-blue-400" />, // Using Bot icon for Python temporarily or find a better match
    "html/css": <Atom className="w-8 h-8 text-orange-400" />,
  };

  const gradientMap = {
    javascript: "from-yellow-400 to-yellow-600",
    python: "from-blue-400 to-blue-600",
    "html/css": "from-orange-400 to-red-500",
  };

  const delayMap = {
    javascript: "delay-[0ms]",
    python: "delay-[100ms]",
    "html/css": "delay-[200ms]",
  };

  useEffect(() => {
    // Show welcome guide if user hasn't seen it yet
    if (profileData && !profileData.hasSeenWelcomeGuide) {
      setShowWelcomeGuide(true);
    }

    const fetchModules = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/modules`);
        const formatted = res.data.map(m => ({
          id: m.name.toLowerCase(),
          title: `${m.name} Zone`,
          description: m.name === "JavaScript" ? "Master the language of the web." :
            m.name === "Python" ? "Dive into data science and AI." :
              "Build beautiful layouts with HTML & CSS.",
          icon: iconMap[m.name.toLowerCase()] || <Code2 />,
          gradient: gradientMap[m.name.toLowerCase()] || "from-blue-500 to-indigo-500",
          delay: delayMap[m.name.toLowerCase()] || "delay-[0ms]",
          dbId: m._id
        }));
        setDynamicModules(formatted);
      } catch (err) {
        console.error("Failed to fetch modules", err);
      }
    };

    const fetchDsaProgress = async () => {
      if (!profileData?._id) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dsa/progress/${profileData._id}`);
        setDsaProgress(res.data);
      } catch (err) {
        console.error("Failed to fetch DSA progress", err);
      }
    };

    fetchModules();
    fetchDsaProgress();
  }, [profileData]);

  if (!profileData) {
    return <Loader text="Loading Dashboard..." fullScreen />;
  }

  // Check if user is new (account created within last 24 hours)
  const isNewUser = user?.metadata?.creationTime
    ? (Date.now() - new Date(user.metadata.creationTime).getTime()) < 24 * 60 * 60 * 1000
    : false;

  const greeting = isNewUser ? "Welcome" : "Welcome back";

  const careerModule = {
    id: "career",
    title: "Career Agent",
    description: "AI-powered guidance for your future career path.",
    icon: <img src="https://res.cloudinary.com/dgbsqglrc/image/upload/v1768656327/CarrerAgent__Avtar-removebg-preview_ehwe5v.png" alt="AI Agent" className="w-18 h-18 object-contain" />,
    gradient: "from-pink-500 to-rose-500",
    delay: "delay-[300ms]",
  };

  const handleWelcomeGuideComplete = () => {
    setShowWelcomeGuide(false);
    // Optionally refresh profile data to get updated hasSeenWelcomeGuide status
  };

  const handleStartDsa = async () => {
    try {
      setStartingDsa(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/dsa/start/${profileData._id}`);
      setShowStartDsaModal(false);
      navigate("/dsa-challenge");
    } catch (err) {
      console.error("Failed to start DSA challenge", err);
    } finally {
      setStartingDsa(false);
    }
  };

  return (
    <>
      {/* Welcome Guide Overlay */}
      {showWelcomeGuide && <WelcomeGuide onComplete={handleWelcomeGuideComplete} />}

      {/* Dashboard Content */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-start md:p-2 animate-slideUpFade">

        {/* Glass Container */}
        <div className="w-full py-6 px-4 md:p-10 rounded-xl border border-white/10 backdrop-blur-2xl shadow-xl">

          {/* Header Section: Welcome + Widgets */}
          <div className="w-full flex flex-col items-center gap-6 mb-6 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 md:flex-row md:items-end md:justify-between">

            {/* Welcome Text */}
            <div className="w-full md:w-auto text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                {greeting}, <span className="bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-shine bg-size-[200%_auto]">{profileData?.username || "Ranker"}</span>
              </h1>
              <p className="text-white/50 text-lg">Ready to level up your skills today?</p>
            </div>

            {/* Widgets */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Leaderboard Widget */}
              <LeaderboardWidget profileData={profileData} />

              {/* DSA Challenge Widget */}
              <DsaChallengeWidget
                progress={dsaProgress}
                onClick={() => {
                  if (dsaProgress?.hasStarted) {
                    navigate("/dsa-challenge");
                  } else {
                    setShowStartDsaModal(true);
                  }
                }}
              />
            </div>

          </div>

          {/* Section Title */}
          <h2 className="text-xl text-white/80 font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Learning Modules
          </h2>

          {/* Learning Modules Grid (3 Cols) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
            {dynamicModules.length > 0 ? (
              dynamicModules.map((module) => (
                <LearningModuleCard key={module.dbId} module={module} />
              ))
            ) : (
              // Skeleton loaders or simple message
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)
            )}
          </div>

          {/* Section Title */}
          <h2 className="text-xl text-white/80 font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            Your AI Companion
          </h2>

          {/* Career Agent Module Component */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <CareerAgentCard careerModule={careerModule} />
          </div>

          {/* Footer */}
          <div className="mt-12 flex items-center justify-between gap-4 text-white/20 text-sm font-medium flex-wrap">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <img src={RankUpLogo} alt="RankUp" className="h-15" />
            </div>

            {/* Right: Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/rudra-dubey"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5" fill="#FFFFFF" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://github.com/Rudra-0607"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5" fill="#FFFFFF" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rudra_06_07_"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#FD5949', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#D6249F', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#285AEB', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Start DSA Modal */}
      <StartDsaModal
        isOpen={showStartDsaModal}
        onClose={() => setShowStartDsaModal(false)}
        onStart={handleStartDsa}
        loading={startingDsa}
      />
    </>
  );
};

export default Dashboard;
