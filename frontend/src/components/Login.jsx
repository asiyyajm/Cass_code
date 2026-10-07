import React, { useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

export const Login = () => {
  const [email, setEmail] = useState("");


  const { login } = useLocalAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email.toLowerCase());
  };

  return (
    <div className={"login-prompt"}>
      <h1>CASS CODE LOGIN</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. student@union.edu"
            required
          />
        </div>

        <button className="submit-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};