import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { useOutletContext } from "react-router-dom";
import Loader from "../components/Loader";
import { Calculator, Atom, Code2, Bot } from "lucide-react";
import LeaderboardWidget from "../components/dashboard/LeaderboardWidget";
import LearningModuleCard from "../components/dashboard/LearningModuleCard";
import CareerAgentCard from "../components/dashboard/CareerAgentCard";
import WelcomeGuide from "../components/WelcomeGuide";

const Dashboard = () => {
  const { user } = useAuth();
  const { profileData } = useOutletContext(); // Get profile data from Layout
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  useEffect(() => {
    // Show welcome guide if user hasn't seen it yet
    if (profileData && !profileData.hasSeenWelcomeGuide) {
      setShowWelcomeGuide(true);
    }
  }, [profileData]);

  if (!profileData) {
    return <Loader text="Loading Dashboard..." fullScreen />;
  }

  // Check if user is new (account created within last 24 hours)
  const isNewUser = user?.metadata?.creationTime
    ? (Date.now() - new Date(user.metadata.creationTime).getTime()) < 24 * 60 * 60 * 1000
    : false;

  const greeting = isNewUser ? "Welcome" : "Welcome back";

  const learningModules = [
    {
      id: "maths",
      title: "Maths Zone",
      description: "Master algorithms, logic, and complex problem-solving.",
      icon: <Calculator className="w-8 h-8 text-purple-400" />,
      gradient: "from-purple-500 to-indigo-500",
      delay: "delay-[0ms]",
    },
    {
      id: "science",
      title: "Science Zone",
      description: "Explore physics simulations and chemical reactions.",
      icon: <Atom className="w-8 h-8 text-emerald-400" />,
      gradient: "from-emerald-400 to-cyan-500",
      delay: "delay-[100ms]",
    },
    {
      id: "coding",
      title: "Coding Zone",
      description: "Build real-world projects and master new languages.",
      icon: <Code2 className="w-8 h-8 text-orange-400" />,
      gradient: "from-orange-400 to-amber-500",
      delay: "delay-[200ms]",
    },
  ];

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
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-start p-2 md:p-8">

        {/* Glass Container */}
        <div className="w-full p-6 md:p-10 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-xl">

          {/* Header Section: Welcome + Leaderboard Widget */}
          <div className="w-full flex flex-col items-center gap-6 mb-6 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 md:flex-row md:items-end md:justify-between">

            {/* Welcome Text */}
            <div className="w-full md:w-auto text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                {greeting}, <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-shine bg-[length:200%_auto]">{profileData?.username || "Ranker"}</span>
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
            {learningModules.map((module) => (
              <LearningModuleCard key={module.id} module={module} />
            ))}
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
