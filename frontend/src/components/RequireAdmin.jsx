import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

const RequireAdmin = () => {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (active) {
          setAuthorized(data.user?.role === "admin");
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("auth-changed"));
        }
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return <main className="px-5 py-20 text-center text-gray-500">Verifying administrator access...</main>;
  }

  return authorized ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default RequireAdmin;