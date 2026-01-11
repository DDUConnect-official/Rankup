import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import GoogleIcon from "../assets/google.png";
import DarkVeil from "../components/DarkVeil";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

const SignupForm = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isStrongPassword = (p) =>
    p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!isStrongPassword(password)) {
      toast.dismiss();
      toast.error("Password needs 8+ chars, 1 uppercase, 1 number.", {
        duration: 3000,
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.dismiss();
      toast.error("Passwords do not match!", {
        duration: 3000,
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    if (!executeRecaptcha) {
      toast.dismiss();
      toast.error("ReCAPTCHA not initialized. Please try again later.", {
        duration: 3000,
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    try {
      // Execute ReCAPTCHA
      const captchaToken = await executeRecaptcha("signup");

      // Verify Captcha with backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
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
        setLoading(false);
        return;
      }

      // Proceed with Firebase Signup
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      toast.dismiss();
      toast.success("Verification email sent! Please check your inbox.", {
        duration: 3000,
        position: "top-right",
      });
      setTimeout(() => navigate("/verify-email"), 2000);
    } catch (err) {
      toast.dismiss();
      const errorMessage = err.code === "auth/email-already-in-use"
        ? "Email already exists."
        : "Signup failed. Please try again.";
      toast.error(errorMessage, {
        duration: 3000,
        position: "top-right",
      });
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
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
      const captchaToken = await executeRecaptcha("google_signup");

      // Verify Captcha with backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
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

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch(`${backendUrl}/api/users/check-profile/${user.email}`);
      const data = await response.json();

      toast.dismiss();
      if (data.exists) {
        toast.success("Signup successful! Welcome back.", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/dashboard");
      } else {
        toast.success("Signup successful! Let's set up your profile.", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/profile-setup", { state: { email: user.email, uid: user.uid } });
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Google sign-in failed. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl md:p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Create Account
          </h2>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center cursor-pointer justify-center gap-3 border border-gray-600 py-3 rounded-lg text-white transition disabled:opacity-60"
          >
            <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
            Sign up with Google
          </button>

          <div className="relative flex py-5 items-center">
            <div className="grow border-t border-gray-600"></div>
            <span className="shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="grow border-t border-gray-600"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg  text-white border border-gray-600 focus:border-white/50 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg text-white border border-gray-600 focus:border-white/50 outline-none bg-transparent"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-[#430abd] text-white py-3 rounded-lg font-bold transition active:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-white/70">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <SignupForm />
    </GoogleReCaptchaProvider>
  );
};

export default Signup;
