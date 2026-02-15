import { useState } from "react";
import axios from "axios";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Step 1: normal signup
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
      });

      // Step 2: get WebAuthn registration options
      const optionsRes = await axios.post(
        "http://localhost:5000/api/auth/register-options",
        { email },
      );

      const credential = await SimpleWebAuthnBrowser.startRegistration(
        optionsRes.data,
      );

      // Step 3: send credential to backend for verification
      await axios.post("http://localhost:5000/api/auth/register-verify", {
        email,
        credential,
      });

      alert("Signup and fingerprint registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.response?.data?.message || err.message);
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
        />
        <br />
        <br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <br />
        <button type="submit">Signup & Register Fingerprint</button>
      </form>
    </div>
  );
}
