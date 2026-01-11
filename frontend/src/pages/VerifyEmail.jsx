import { useNavigate } from "react-router-dom";
import DarkVeil from "../components/DarkVeil";

const VerifyEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen overflow-x-hidden">

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl text-center md:p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Verify Your Email
          </h1>

          <p className="text-gray-400 mb-6">
            Check your inbox for a verification link. After successfull verification login to your account.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full cursor-pointer bg-[#430abd] text-white py-3 rounded-lg font-bold transition active:scale-[1.02]"
            >
              Proceed to Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="w-full cursor-pointer py-2 font-medium rounded-lg border border-white/50 text-white/70 transition"
            >
              Back to Signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
