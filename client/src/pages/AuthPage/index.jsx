import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../../lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "../../utils/constants";
import { useAppStore } from "../../store";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const { setUserInfo, setActiveIcon } = useAppStore();

  /* ---------------- LOGIN STATE ---------------- */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  /* ---------------- SIGNUP STATE ---------------- */
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ---------------- VALIDATION ---------------- */
  const validateLogin = () => {
    if (!loginEmail || !loginPassword) {
      toast.warn("Email and password are required");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!signupEmail || !signupPassword) {
      toast.warn("Email and password are required");
      return false;
    }
    if (signupPassword !== confirmPassword) {
      toast.warn("Passwords do not match");
      return false;
    }
    return true;
  };

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLogin()) return;

    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        {
          email: loginEmail,
          password: loginPassword,
        },
        { withCredentials: true }
      );

      if (response.data?.user) {
        setUserInfo(response.data.user);

        localStorage.setItem("token", response.data.token);

        if (response.data.user.profileSetup) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }

        setActiveIcon("chat");
        toast.success("Login successful");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateSignup()) return;

    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        {
          email: signupEmail,
          password: signupPassword,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setUserInfo(response.data.user);

        localStorage.setItem("token", response.data.token);

        navigate("/profile");

        toast.success("Signup successful");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Signup failed");
    }
  };

  /* ---------------- UI TOGGLE ---------------- */
  const containerRef = useRef(null);
  const signUpButtonRef = useRef(null);
  const signInButtonRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const signUpButton = signUpButtonRef.current;
    const signInButton = signInButtonRef.current;

    const handleSignUpClick = () => {
      container.classList.add("right-panel-active");
    };

    const handleSignInClick = () => {
      container.classList.remove("right-panel-active");
    };

    signUpButton.addEventListener("click", handleSignUpClick);
    signInButton.addEventListener("click", handleSignInClick);

    return () => {
      signUpButton.removeEventListener("click", handleSignUpClick);
      signInButton.removeEventListener("click", handleSignInClick);
    };
  }, []);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="auth-page">
      <div className="container" ref={containerRef} id="container">

        {/* ---------------- SIGN UP ---------------- */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1>Sign up</h1>

            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit">
              Sign Up
            </button>
          </form>
        </div>

        {/* ---------------- SIGN IN ---------------- */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign in</h1>

            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button type="submit">
              Sign In
            </button>
          </form>
        </div>

        {/* ---------------- OVERLAY ---------------- */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Login to continue</p>
              <button className="ghost" ref={signInButtonRef}>
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello!</h1>
              <p>Create your account</p>
              <button className="ghost" ref={signUpButtonRef}>
                Sign Up
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
