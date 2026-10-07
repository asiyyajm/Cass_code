import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/layout.css";

export const Layout = () => {
  const { user, logout } = useLocalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const getReturnPath = () => {
    return user?.is_teacher ? "/instructors/homepage" : "/students/homepage";
  }

  return (
    <div>
      <header className="app-header">
        <div className="brand">
          <button className="logo-button" onClick={()=> navigate(getReturnPath())}>
          <img src="/logo-96.png" alt="CASS Code Logo" className="brand-logo" />
          </button>
          <h1>CASS CODE</h1>
        </div>

        <div>
          <span>Logged in as: {user?.name}</span>

          {location.pathname !== "/students/homepage" &&
            location.pathname !== "/instructors/homepage" && (
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
            )}

          <button className="back-btn" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  );
};