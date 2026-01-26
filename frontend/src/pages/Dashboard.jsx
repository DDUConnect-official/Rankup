import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { useOutletContext } from "react-router-dom";
import Loader from "../components/Loader";
import { Calculator, Atom, Code2, Bot } from "lucide-react";
import axios from "axios";
import LeaderboardWidget from "../components/dashboard/LeaderboardWidget";
import LearningModuleCard from "../components/dashboard/LearningModuleCard";
import CareerAgentCard from "../components/dashboard/CareerAgentCard";
import WelcomeGuide from "../components/WelcomeGuide";

const Dashboard = () => {
  const { user } = useAuth();
  const { profileData } = useOutletContext(); // Get profile data from Layout
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [dynamicModules, setDynamicModules] = useState([]);

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
    fetchModules();
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

  return (
    <>
      {/* Welcome Guide Overlay */}
      {showWelcomeGuide && <WelcomeGuide onComplete={handleWelcomeGuideComplete} />}

      {/* Dashboard Content */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-start md:p-2 animate-slideUpFade">

        {/* Glass Container */}
        <div className="w-full p-6 md:p-10 rounded-xl border border-white/10 backdrop-blur-2xl shadow-xl">

          {/* Header Section: Welcome + Leaderboard Widget */}
          <div className="w-full flex flex-col items-center gap-6 mb-6 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 md:flex-row md:items-end md:justify-between">

            {/* Welcome Text */}
            <div className="w-full md:w-auto text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                {greeting}, <span className="bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-shine bg-size-[200%_auto]">{profileData?.username || "Ranker"}</span>
              </h1>
              <p className="text-white/50 text-lg">Ready to level up your skills today?</p>
            </div>

            {/* Leaderboard Widget Component */}
            <LeaderboardWidget profileData={profileData} />

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
          <div className="mt-12 flex items-center justify-center gap-2 text-white/20 text-sm font-medium">
            STEM Gamified Platform
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
