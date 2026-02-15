import { useState } from "react";
import axios from "axios";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import { useNavigate } from "react-router-dom";

/* --------------------------------------------------
   Axios instance (CRITICAL for mobile + WebAuthn)
-------------------------------------------------- */
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!process.env.REACT_APP_BACKEND_URL) {
      alert("Backend URL is not configured");
      return;
    }

    try {
      setLoading(true);

      /* ---------------- STEP 1: NORMAL SIGNUP ---------------- */
      await api.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      /* -------- STEP 2: GET WEBAUTHN REGISTRATION OPTIONS ----- */
      const optionsRes = await api.post("/api/auth/register-options", {
        email,
      });

      /* -------- STEP 3: START WEBAUTHN (MOBILE SAFE) ---------- */
      const credential = await SimpleWebAuthnBrowser.startRegistration(
        optionsRes.data,
      );

      /* -------- STEP 4: VERIFY WEBAUTHN CREDENTIAL ------------ */
      await api.post("/api/auth/register-verify", {
        email,
        credential,
      });

      alert("Signup & fingerprint registration successful!");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);

      const message =
        err.response?.data?.message || err.message || "Signup failed";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Signup</h1>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Signup & Register Fingerprint"}
        </button>
      </form>
    </div>
  );
}
