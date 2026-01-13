import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  setPersistence, // Added for session control
  browserLocalPersistence, // For "Remember Me"
  browserSessionPersistence, // For "Don't Remember"
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import GoogleIcon from "../assets/google.png";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import Loader from "../components/Loader";

const LoginForm = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // New state for checkbox

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Set persistence based on checkbox before signing in
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.error("Please verify your email first.", {
          duration: 3000,
          position: "top-right",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/users/check-profile/${user.email}`);
      const data = await response.json();

      toast.dismiss(); // Dismiss any existing toasts
      if (data.exists) {
        toast.success("Login successful! Welcome back.", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/dashboard");
      } else {
        toast.success("Login successful! Let's set up your profile.", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/profile-setup", { state: { email: user.email, uid: user.uid } });
      }
    } catch (err) {
      toast.dismiss(); // Dismiss any existing toasts
      toast.error("Invalid credentials. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");

    if (!executeRecaptcha) {
      toast.dismiss();
      toast.error("ReCAPTCHA not initialized. Please try again later.", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    try {
      // Execute ReCAPTCHA
      const captchaToken = await executeRecaptcha("google_login");

      // Verify Captcha with backend
      const captchaResponse = await fetch(`${backendUrl}/api/auth/verify-captcha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });

      const captchaData = await captchaResponse.json();

      if (!captchaData.success) {
        toast.dismiss();
        toast.error(captchaData.message || "Captcha verification failed.", {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      // Google login also respects persistence
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch(`${backendUrl}/api/users/check-profile/${user.email}`);
      const data = await response.json();

      toast.dismiss(); // Dismiss any existing toasts
      if (data.exists) {
        toast.success("Login successful! Welcome back.", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/dashboard");
      } else {
        toast.success("Login successful! Let's set up your profile.", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/profile-setup", { state: { email: user.email, uid: user.uid } });
      }
    } catch (err) {
      toast.dismiss(); // Dismiss any existing toasts
      toast.error("Google sign-in failed. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.dismiss(); // Dismiss any existing toasts
      toast.error("Please enter your email to reset password.", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.dismiss(); // Dismiss any existing toasts
      toast.success("Password reset link sent to your email.", {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      toast.dismiss(); // Dismiss any existing toasts
      toast.error("Unable to send reset email. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  return (
    <div className="w-full h-screen overflow-x-hidden">
      <div className="absolute top-0 left-0 mx-auto min-h-screen w-full flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl shadow-6xl p-6 backdrop-blur-xl border border-white/10 md:p-8">
          <div className="flex justify-center">
            <img src={RankUpLogo} alt="RankUp" className="h-20 md:h-22" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Login Your Account
          </h2>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="cursor-pointer w-full flex items-center justify-center gap-3 border border-gray-600 py-3 rounded-lg text-white transition disabled:opacity-60"
          >
            <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative flex py-5 items-center">
            <div className="grow border-t border-gray-600"></div>
            <span className="shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="grow border-t border-gray-600"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-white/70 md:text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 accent-[#430abd] cursor-pointer"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="cursor-pointer text-xs text-white/70 hover:text-white md:text-sm"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-[#430abd] active:scale-[0.98] text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            New to RankUp?{" "}
            <Link to="/signup" className="font-semibold text-white/70 hover:text-white">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      {loading && <Loader text="Logging you in..." fullScreen />}
    </div>
  );
};

const Login = () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

export default Login;